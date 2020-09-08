/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { IntExpression, ExpressionParser } from 'adaptive-expressions';
import { Activity, ActivityTypes, getTopScoringIntent, RecognizerResult, StringUtils, TurnContext, telemetryTrackDialogView } from 'botbuilder-core';
import { Dialog, DialogContainer, DialogContext, DialogDependencies, DialogEvent, DialogInstance, DialogPath, DialogReason, DialogState, DialogTurnResult, DialogTurnStatus, TurnPath } from 'botbuilder-dialogs';
import { ActionContext } from './actionContext';
import { AdaptiveDialogState } from './adaptiveDialogState';
import { AdaptiveEvents } from './adaptiveEvents';
import { OnCondition } from './conditions';
import { EntityAssignment } from './entityAssignment';
import { EntityAssignments } from './entityAssignments';
import { EntityInfo, NormalizedEntityInfos } from './entityInfo';
import { LanguageGenerator } from './languageGenerator';
import { languageGeneratorKey } from './languageGeneratorExtensions';
import { Recognizer, RecognizerSet } from './recognizers';
import { ValueRecognizer } from './recognizers/valueRecognizer';
import { SchemaHelper } from './schemaHelper';
import { FirstSelector } from './selectors';
import { TriggerSelector } from './triggerSelector';

export class AdaptiveDialog<O extends object = {}> extends DialogContainer<O> {
    public static conditionTracker = 'dialog._tracker.conditions';

    private readonly adaptiveKey = '_adaptive';
    private readonly defaultOperationKey = '$defaultOperation';
    private readonly expectedOnlyKey = '$expectedOnly';
    private readonly entitiesKey = '$entities';
    private readonly instanceKey = '$instance';
    private readonly operationsKey = '$operations';
    private readonly propertyNameKey = 'PROPERTYName';
    private readonly utteranceKey = 'utterance';

    private readonly generatorTurnKey = Symbol('generatorTurn');
    private readonly changeTurnKey = Symbol('changeTurn');

    private _recognizerSet = new RecognizerSet();
    private installedDependencies = false;
    private needsTracker = false;
    private dialogSchema: SchemaHelper;
    private _internalVersion: string;

    /**
     * Creates a new `AdaptiveDialog` instance.
     * @param dialogId (Optional) unique ID of the component within its parents dialog set.
     */
    public constructor(dialogId?: string) {
        super(dialogId);
    }

    /**
     * Optional. Recognizer used to analyze any message utterances.
     */
    public recognizer?: Recognizer;

    /**
     * Optional. Language Generator override.
     */
    public generator?: LanguageGenerator;

    /**
     * Trigger handlers to respond to conditions which modify the executing plan.
     */
    public triggers: OnCondition[] = [];

    /**
     * Whether to end the dialog when there are no actions to execute.
     * @remarks
     * If true, when there are no actions to execute, the current dialog will end.
     * If false, when there are no actions to execute, the current dialog will simply end the turn and still be active.
     * Defaults to a value of true.
     */
    public autoEndDialog: boolean = true;

    /**
     * Optional. The selector for picking the possible events to execute.
     */
    public selector: TriggerSelector;

    /**
     * The property to return as the result when the dialog ends when there are no more Actions and `AutoEndDialog = true`.
     * @remarks
     * Defaults to a value of `dialog.result`.
     */
    public defaultResultProperty: string = 'dialog.result';

    /**
     * JSON Schema for the dialog.
     */
    public set schema(value: object) {
        this.dialogSchema = new SchemaHelper(value);
    }

    public get schema(): object | undefined {
        return this.dialogSchema ? this.dialogSchema.schema : undefined;
    }

    protected ensureDependenciesInstalled(): void {
        if (this.installedDependencies) {
            return;
        }
        this.installedDependencies = true;

        // Install each trigger actions
        let id = 0;
        for (let i = 0; i < this.triggers.length; i++) {
            const trigger = this.triggers[i];

            // Install any dependencies
            if (typeof ((trigger as any) as DialogDependencies).getDependencies == 'function') {
                ((trigger as any) as DialogDependencies).getDependencies().forEach((child) => this.dialogs.add(child));
            }

            if (trigger.runOnce) {
                this.needsTracker = true;
            }

            if (!trigger.priority) {
                trigger.priority = new IntExpression(id);
            }

            if (!trigger.id) {
                trigger.id = id.toString();
                id++;
            }
        }

        if (!this.selector) {
            // Default to first selector
            // TODO: Implement MostSpecificSelector (needs TriggerTree)
            this.selector = new FirstSelector();
        }
        this.selector.initialize(this.triggers, true);
    }

    //---------------------------------------------------------------------------------------------
    // Base Dialog Overrides
    //---------------------------------------------------------------------------------------------

    protected getInternalVersion(): string {
        if (!this._internalVersion) {
            // change the container version if any dialogs are added or removed.
            let version = this.dialogs.getVersion();

            // change version if the schema has changed.
            if (this.schema) {
                version += JSON.stringify(this.schema);
            }

            // change if triggers type/constraint change
            const parser = new ExpressionParser();
            this.triggers.forEach((trigger): void => {
                version += trigger.getExpression(parser).toString();
            });

            this._internalVersion = StringUtils.hash(version);
        }

        return this._internalVersion;
    }

    protected onComputeId(): string {
        return `AdaptiveDialog[]`;
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        await this.checkForVersionChange(dc);

        // Install dependencies on first access
        this.ensureDependenciesInstalled();

        // Initialize dialog state
        if (options) {
            // Replace initial activeDialog.State with clone of options
            dc.activeDialog.state = JSON.parse(JSON.stringify(options));
        }

        // Initialize event counter
        const dcState = dc.state;
        if (dcState.getValue(DialogPath.eventCounter) == undefined) {
            dcState.setValue(DialogPath.eventCounter, 0);
        }

        // Initialize list of required properties
        if (this.dialogSchema && dcState.getValue(DialogPath.requiredProperties) == undefined) {
            //  RequiredProperties control what properties must be filled in.
            dcState.setValue(DialogPath.requiredProperties, this.dialogSchema.required);
        }

        // Initialize change tracker
        if (this.needsTracker && dcState.getValue(AdaptiveDialog.conditionTracker) == undefined) {
            this.triggers.forEach((trigger): void => {
                if (trigger.runOnce && trigger.condition) {
                    const references = trigger.condition.toExpression().references();
                    var paths = dcState.trackPaths(references);
                    var triggerPath = `${ AdaptiveDialog.conditionTracker }.${ trigger.id }.`;
                    dcState.setValue(triggerPath + 'paths', paths);
                    dcState.setValue(triggerPath + 'lastRun', 0);
                }
            });
        }

        dc.activeDialog.state[this.adaptiveKey] = {};

        const properties: { [key: string]: string } = {
            'DialogId' : this.id,  
            'Kind' : 'Microsoft.AdaptiveDialog',
        };
        this.telemetryClient.trackEvent({
            name: 'AdaptiveDialogStart',
            properties: properties
        });
        telemetryTrackDialogView(this.telemetryClient, this.id);

        // Evaluate events and queue up action changes
        const event: DialogEvent = { name: AdaptiveEvents.beginDialog, value: options, bubble: false };
        await this.onDialogEvent(dc, event);

        // Continue action execution
        return await this.continueActions(dc);
    }

    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        await this.checkForVersionChange(dc);

        this.ensureDependenciesInstalled();

        // Continue action execution
        return await this.continueActions(dc);
    }

    public async endDialog(turnContext: TurnContext, instance: DialogInstance, reason: DialogReason): Promise<void> {
        const properties: { [key: string]: string } = {
            'DialogId' : this.id, 
            'Kind' : 'Microsoft.AdaptiveDialog' 
        };
        if (reason == DialogReason.cancelCalled) {
            this.telemetryClient.trackEvent({
                name: 'AdaptiveDialogCancel', 
                properties: properties
            });
        } else if (reason == DialogReason.endCalled){
            this.telemetryClient.trackEvent({
                name: 'AdaptiveDialogComplete',
                properties: properties
            });
        }
        await super.endDialog(turnContext, instance, reason);
    }

    protected async onPreBubbleEvent(dc: DialogContext, event: DialogEvent): Promise<boolean> {
        const actionContext = this.toActionContext(dc);

        // Process event and queue up any potential interruptions
        return await this.processEvent(actionContext, event, true);
    }

    protected async onPostBubbleEvent(dc: DialogContext, event: DialogEvent): Promise<boolean> {
        const actionContext = this.toActionContext(dc);

        // Process event and queue up any potential interruptions
        return await this.processEvent(actionContext, event, false);
    }

    public async resumeDialog(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        await this.checkForVersionChange(dc);

        // Containers are typically leaf nodes on the stack but the dev is free to push other dialogs
        // on top of the stack which will result in the container receiving an unexpected call to
        // resumeDialog() when the pushed on dialog ends.
        // To avoid the container prematurely ending we need to implement this method and simply
        // ask our inner dialog stack to re-prompt.
        await this.repromptDialog(dc.context, dc.activeDialog);

        return Dialog.EndOfTurn;
    }

    public async repromptDialog(context: DialogContext | TurnContext, instance: DialogInstance): Promise<void> {
        if (context instanceof DialogContext) {
            // Forward to current sequence action
            const state: AdaptiveDialogState = instance.state[this.adaptiveKey];
            if (state && state.actions && state.actions.length > 0) {
                // we need to mockup a DialogContext so that we can call RepromptDialog
                // for the active step
                const childContext = this.createChildContext(context);
                await childContext.repromptDialog();
            }
        } else {
            await super.repromptDialog(context, instance);
        }
    }

    public createChildContext(dc: DialogContext): DialogContext {
        const activeDialogState = dc.activeDialog.state;
        let state: AdaptiveDialogState = activeDialogState[this.adaptiveKey];
        if (!state) {
            state = { actions: [] };
        }

        if (state.actions && state.actions.length > 0) {
            const childContext = new DialogContext(this.dialogs, dc, state.actions[0]);
            this.onSetScopedServices(childContext);
            return childContext;
        }
        return undefined;
    }

    public getDependencies(): Dialog[] {
        this.ensureDependenciesInstalled();
        return [];
    }

    //---------------------------------------------------------------------------------------------
    // Event Processing
    //---------------------------------------------------------------------------------------------

    protected async processEvent(actionContext: ActionContext, dialogEvent: DialogEvent, preBubble: boolean): Promise<boolean> {
        // Save into turn
        actionContext.state.setValue(TurnPath.dialogEvent, dialogEvent);

        let activity = actionContext.state.getValue<Activity>(TurnPath.activity);

        // some dialogevents get promoted into turn state for general access outside of the dialogevent.
        // This allows events to be fired (in the case of ChooseIntent), or in interruption (Activity) 
        // Triggers all expressed against turn.recognized or turn.activity, and this mapping maintains that 
        // any event that is emitted updates those for the rest of rule evaluation.
        switch (dialogEvent.name) {
            case AdaptiveEvents.recognizedIntent:
                // we have received a RecognizedIntent event
                // get the value and promote to turn.recognized, topintent, topscore and lastintent
                const recognizedResult = actionContext.state.getValue<RecognizerResult>(`${ TurnPath.dialogEvent }.value`);
                const { intent, score } = getTopScoringIntent(recognizedResult);
                actionContext.state.setValue(TurnPath.recognized, recognizedResult);
                actionContext.state.setValue(TurnPath.topIntent, intent);
                actionContext.state.setValue(TurnPath.topScore, score);
                actionContext.state.setValue(DialogPath.lastEvent, intent);

                // process entities for ambiguity processing (We do this regardless of who handles the event)
                this.processEntities(actionContext, activity);
                break;
            case AdaptiveEvents.activityReceived:
                // we received an ActivityReceived event, promote the activity into turn.activity
                actionContext.state.setValue(TurnPath.activity, dialogEvent.value);
                activity = dialogEvent.value as Activity;
                break;
        }

        this.ensureDependenciesInstalled();

        // Count of events processed
        var count = actionContext.state.getValue(DialogPath.eventCounter);
        actionContext.state.setValue(DialogPath.eventCounter, ++count);

        // Look for triggered rule
        let handled = await this.queueFirstMatch(actionContext);
        if (handled) {
            return true;
        }

        // Perform default processing
        if (preBubble) {
            switch (dialogEvent.name) {
                case AdaptiveEvents.beginDialog:
                    if (!actionContext.state.getValue(TurnPath.activityProcessed)) {
                        const activityReceivedEvent: DialogEvent = {
                            name: AdaptiveEvents.activityReceived,
                            value: actionContext.context.activity,
                            bubble: false
                        };
                        handled = await this.processEvent(actionContext, activityReceivedEvent, true);
                    }
                    break;
                case AdaptiveEvents.activityReceived:
                    if (activity.type === ActivityTypes.Message) {
                        // Recognize utterance (ignore handled)
                        const recognizeUtteranceEvent: DialogEvent = {
                            name: AdaptiveEvents.recognizeUtterance,
                            value: activity,
                            bubble: false
                        };
                        await this.processEvent(actionContext, recognizeUtteranceEvent, true);

                        // Emit leading RecognizedIntent event
                        const recognized = actionContext.state.getValue<RecognizerResult>(TurnPath.recognized);
                        const recognizedIntentEvent: DialogEvent = {
                            name: AdaptiveEvents.recognizedIntent,
                            value: recognized,
                            bubble: false
                        };
                        handled = await this.processEvent(actionContext, recognizedIntentEvent, true);
                    }

                    // Has an interruption occurred?
                    // - Setting this value to true causes any running inputs to re-prompt when they're
                    //   continued.  The developer can clear this flag if they want the input to instead
                    //   process the users utterance when its continued.
                    if (handled) {
                        actionContext.state.setValue(TurnPath.interrupted, true);
                    }
                    break;
                case AdaptiveEvents.recognizeUtterance:
                    if (activity.type == ActivityTypes.Message) {
                        // Recognize utterance
                        const recognizedResult = await this.onRecognize(actionContext, activity);
                        // TODO figure out way to not use turn state to pass this value back to caller.
                        actionContext.state.setValue(TurnPath.recognized, recognizedResult);
                        const { intent, score } = getTopScoringIntent(recognizedResult);
                        actionContext.state.setValue(TurnPath.topIntent, intent);
                        actionContext.state.setValue(TurnPath.topScore, score);
                        actionContext.state.setValue(DialogPath.lastIntent, intent);
                        handled = true;
                    }
                    break;
                case AdaptiveEvents.repromptDialog:
                    // AdaptiveDialogs handle new RepromptDialog as it gives access to the dialogContext.
                    await this.repromptDialog(actionContext, actionContext.activeDialog);
                    handled = true;
                    break;
            }
        } else {
            switch (dialogEvent.name) {
                case AdaptiveEvents.beginDialog:
                    if (!actionContext.state.getValue(TurnPath.activityProcessed)) {
                        const activityReceivedEvent: DialogEvent = {
                            name: AdaptiveEvents.activityReceived,
                            value: activity,
                            bubble: false
                        };
                        // Emit trailing ActivityReceived event
                        handled = await this.processEvent(actionContext, activityReceivedEvent, false);
                    }
                    break;
                case AdaptiveEvents.activityReceived:
                    if (activity.type === ActivityTypes.Message) {
                        // Do we have an empty sequence?
                        if (actionContext.actions.length == 0) {
                            const unknownIntentEvent: DialogEvent = {
                                name: AdaptiveEvents.unknownIntent,
                                bubble: false
                            };
                            // Emit trailing UnknownIntent event
                            handled = await this.processEvent(actionContext, unknownIntentEvent, false);
                        } else {
                            handled = false;
                        }
                    }

                    // Has an interruption occurred?
                    // - Setting this value to true causes any running inputs to re-prompt when they're
                    //   continued.  The developer can clear this flag if they want the input to instead
                    //   process the users utterance when its continued.
                    if (handled) {
                        actionContext.state.setValue(TurnPath.interrupted, true);
                    }
                    break;
            }
        }

        return handled;
    }

    protected async onRecognize(actionContext: ActionContext, activity: Activity): Promise<RecognizerResult> {
        const { text } = activity;
        const noneIntent: RecognizerResult = {
            text: text || '',
            intents: { 'None': { score: 0.0 } },
            entities: {}
        };

        if (this.recognizer) {
            if (this._recognizerSet.recognizers.length == 0) {
                this._recognizerSet.recognizers.push(this.recognizer);
                this._recognizerSet.recognizers.push(new ValueRecognizer());
            }
            const recognized = await this._recognizerSet.recognize(actionContext, activity);
            const { intent } = getTopScoringIntent(recognized);
            for (const key in recognized.intents) {
                if (key != intent) {
                    delete recognized[key];
                }
            }
            return recognized;
        } else {
            return noneIntent;
        }
    }

    private async queueFirstMatch(actionContext: ActionContext): Promise<boolean> {
        const selection = await this.selector.select(actionContext);
        if (selection.length > 0) {
            const evt = this.triggers[selection[0]];
            const parser = new ExpressionParser();
            const properties: { [key: string]: string } = {
                'DialogId': this.id, 
                'Expression': evt.getExpression(parser).toString(),
                'Kind': `Microsoft.${ evt.constructor.name }`,
                'ConditionId': evt.id
            };
            this.telemetryClient.trackEvent({
                name: 'AdaptiveDialogTrigger',
                properties: properties
            });

            const changes = await evt.execute(actionContext);
            if (changes && changes.length > 0) {
                actionContext.queueChanges(changes[0]);
                return true;
            }
        }

        return false;
    }

    //---------------------------------------------------------------------------------------------
    // Action Execution
    //---------------------------------------------------------------------------------------------

    protected async continueActions(dc: DialogContext): Promise<DialogTurnResult> {
        // Apply any queued up changes
        const actionContext = this.toActionContext(dc);
        await actionContext.applyChanges();

        // Get a unique instance ID for the current stack entry.
        // - We need to do this because things like cancellation can cause us to be removed
        //   from the stack and we want to detect this so we can stop processing actions.
        const instanceId = this.getUniqueInstanceId(actionContext);

        // Create context for active action
        let actionDC = this.createChildContext(actionContext);
        while (actionDC) {
            // Continue current action
            let result = await actionDC.continueDialog();

            // Start action if not continued
            if (result.status == DialogTurnStatus.empty && this.getUniqueInstanceId(actionContext) == instanceId) {
                const nextAction = actionContext.actions[0];
                result = await actionDC.beginDialog(nextAction.dialogId, nextAction.options);
            }

            // Is the step waiting for input or were we cancelled?
            if (result.status == DialogTurnStatus.waiting || this.getUniqueInstanceId(actionContext) != instanceId) {
                return result;
            }

            // End current step
            await this.endCurrentAction(actionContext);

            if (result.status == DialogTurnStatus.completeAndWait) {
                // Child dialog completed, but wants us to wait for a new activity
                result.status = DialogTurnStatus.waiting;
                return result;
            }

            let parentChanges = false;
            let root = actionContext;
            let parent = actionContext.parent;
            while (parent) {
                const ac = parent as ActionContext;
                if (ac && ac.changes && ac.changes.length > 0) {
                    parentChanges = true;
                }
                root = parent as ActionContext;
                parent = root.parent;
            }

            // Execute next step
            if (parentChanges) {
                // Recursively call continueDialog() to apply parent changes and continue execution
                return await root.continueDialog();
            }

            // Apply any locale changes and fetch next action
            await actionContext.applyChanges();
            actionDC = this.createChildContext(actionContext);
        }

        return await this.onEndOfActions(actionContext);
    }

    protected onSetScopedServices(dialogContext: DialogContext): void {
        if (this.generator) {
            dialogContext.services.set(languageGeneratorKey, this.generator);
        }
    }

    protected async endCurrentAction(actionContext: ActionContext): Promise<boolean> {
        if (actionContext.actions.length > 0) {
            actionContext.actions.shift();
        }

        return false;
    }

    protected async onEndOfActions(actionContext: ActionContext): Promise<DialogTurnResult> {
        // Is the current dialog still on the stack?
        if (actionContext.activeDialog) {
            // Completed actions so continue processing entity assignments
            const handled = await this.processQueues(actionContext);
            if (handled) {
                // Still processing assignments
                return await this.continueActions(actionContext);
            } else if (this.shouldEnd(actionContext)) {
                const result = actionContext.state.getValue(this.defaultResultProperty);
                return await actionContext.endDialog(result);
            }
            return Dialog.EndOfTurn;
        }
        return { status: DialogTurnStatus.cancelled };
    }

    private getUniqueInstanceId(dc: DialogContext): string {
        return dc.stack.length > 0 ? `${ dc.stack.length }:${ dc.activeDialog.id }` : '';
    }

    private shouldEnd(dc: DialogContext): boolean {
        return this.autoEndDialog;
    }

    private toActionContext(dc: DialogContext): ActionContext {
        const activeDialogState = dc.activeDialog.state;
        let state: AdaptiveDialogState = activeDialogState[this.adaptiveKey];

        if (!state) {
            state = { actions: [] };
            activeDialogState[this.adaptiveKey] = state;
        }

        if (!state.actions) {
            state.actions = [];
        }

        const dialogState: DialogState = { dialogStack: dc.stack };
        const actionContext = new ActionContext(dc.dialogs, dc, dialogState, state.actions, this.changeTurnKey);
        actionContext.parent = dc.parent;
        // use configuration of dc's state
        if (!actionContext.parent) {
            actionContext.state.configuration = dc.state.configuration;
        }
        return actionContext;
    }

    /**
     * This function goes through the entity assignments and emits events if present.
     */
    private async processQueues(actionContext: ActionContext): Promise<boolean> {
        let evt: DialogEvent;
        let handled = false;
        const assignments = EntityAssignments.read(actionContext);
        const nextAssignment = assignments.nextAssignment;
        if (nextAssignment) {
            evt = {
                name: nextAssignment.event,
                value: nextAssignment.alternative ? nextAssignment.alternatives : nextAssignment,
                bubble: false
            };

            if (nextAssignment.event == AdaptiveEvents.assignEntity) {
                // TODO: (from C#) For now, I'm going to dereference to a one-level array value.  There is a bug in the current code in the distinction between
                // @ which is supposed to unwrap down to non-array and @@ which returns the whole thing. @ in the curent code works by doing [0] which
                // is not enough.
                let entity = nextAssignment.entity.value;
                if (!Array.isArray(entity)) {
                    entity = [entity];
                }

                actionContext.state.setValue(`${ TurnPath.recognized }.entities.${ nextAssignment.entity.name }`, entity);
                assignments.dequeue(actionContext);
            }

            actionContext.state.setValue(DialogPath.lastEvent, evt.name);
            handled = await this.processEvent(actionContext, evt, true);
            if (!handled) {
                // If event wasn't handled, remove it.
                if (nextAssignment && nextAssignment.event !== AdaptiveEvents.assignEntity) {
                    assignments.dequeue(actionContext);
                }

                // See if more assignments or end of actions.
                handled = await this.processQueues(actionContext);
            }
        } else {
            // Emit end of actions
            evt = {
                name: AdaptiveEvents.endOfActions,
                bubble: false
            };
            actionContext.state.setValue(DialogPath.lastEvent, evt.name);
            handled = await this.processEvent(actionContext, evt, true);
        }

        return handled;
    }

    /**
     * Process entities to identify ambiguity and possible assigment to properties.  Broadly the steps are:
     * Normalize entities to include meta-data
     * Check to see if an entity is in response to a previous ambiguity event
     * Assign entities to possible properties
     * Merge new queues into existing queues of ambiguity events
    */
    private processEntities(actionContext: ActionContext, activity: Activity): void {
        if (this.dialogSchema) {
            const lastEvent = actionContext.state.getValue(DialogPath.lastEvent);
            if (lastEvent) {
                actionContext.state.deleteValue(DialogPath.lastEvent);
            }

            const assignments = EntityAssignments.read(actionContext);
            const entities = this.normalizeEntities(actionContext);
            const utterance = activity.type == ActivityTypes.Message ? activity.text : '';

            // Utterance is a special entity that corresponds to the full utterance
            entities[this.utteranceKey] = [Object.assign(new EntityInfo(), {
                priority: Number.MAX_SAFE_INTEGER,
                coverage: 1,
                start: 0,
                end: utterance.length,
                name: this.utteranceKey,
                score: 0,
                type: 'string',
                value: utterance,
                text: utterance
            })];
            const recognized = this.assignEntities(actionContext, entities, assignments, lastEvent);
            const unrecognized = this.splitUtterance(utterance, recognized);

            // Utterance is a special entity that corresponds to the full utterance
            actionContext.state.setValue(TurnPath.unrecognizedText, unrecognized);
            actionContext.state.setValue(TurnPath.recognizedEntities, recognized);
            assignments.write(actionContext);
        }
    }

    private splitUtterance(utterance: string, recognized: Partial<EntityInfo>[]): string[] {
        const unrecognized = [];
        var current = 0;
        for (let i = 0; i < recognized.length; i++) {
            const entity = recognized[i];
            if (entity.start > current) {
                unrecognized.push(utterance.substr(current, entity.start - current).trim());
            }

            current = entity.end;
        }

        if (current < utterance.length) {
            unrecognized.push(utterance.substr(current));
        }

        return unrecognized;
    }

    private normalizeEntities(actionContext: ActionContext): NormalizedEntityInfos {
        const entityToInfo: NormalizedEntityInfos = {};
        const recognized = actionContext.state.getValue(TurnPath.recognized);
        const text = recognized.text;
        const entities: { [name: string]: any[] } = recognized.entities || {};
        const turn = actionContext.state.getValue(DialogPath.eventCounter);
        const operations: string[] = (this.dialogSchema.schema && this.dialogSchema.schema[this.operationsKey]) || [];
        const metaData = entities[this.instanceKey] as object;
        for (const name in entities) {
            if (operations.indexOf(name) >= 0) {
                const values = entities[name];
                for (let i = 0; i < values.length; i++) {
                    const composite = values[i];
                    const childInstance = composite[this.instanceKey];
                    let pname: Partial<EntityInfo>;
                    if (Object.keys(composite).length > 1) {
                        // Find PROPERTYName so we can apply it to other entities
                        for (const key in composite) {
                            if (key == this.propertyNameKey) {
                                // Expand PROPERTYName and fold single match into siblings span
                                // TODO: Would we ever need to handle multiple?
                                const infos: NormalizedEntityInfos = {};
                                const child = composite[key];
                                this.expandEntity(child, childInstance, name, undefined, turn, text, infos);
                                pname = infos[this.propertyNameKey][0];
                                break;
                            }
                        }
                    }

                    for (const key in composite) {
                        const child = composite[key];
                        // Drop PROPERTYName if we are applying it to other entities
                        if (!pname || key == this.propertyNameKey) {
                            this.expandEntity(child, childInstance, name, pname, turn, text, entityToInfo);
                        }
                    }
                }
            } else {
                this.expandEntity(entities[name], metaData, undefined, undefined, turn, text, entityToInfo);
            }
        }

        // When there are multiple possible resolutions for the same entity that overlap, pick the 
        // one that covers the most of the utterance.
        for (const name in entityToInfo) {
            const infos = entityToInfo[name];
            infos.sort((entity1, entity2): number => {
                let val = 0;
                if (entity1.start == entity2.start) {
                    if (entity1.end > entity2.end) {
                        val = -1;
                    } else if (entity1.end < entity2.end) {
                        val = +1;
                    }
                } else if (entity1.start < entity2.start) {
                    val = -1;
                } else {
                    val = +1;
                }

                return val;
            });
            for (let i = 0; i < infos.length; ++i) {
                const current = infos[i];
                for (let j = i + 1; j < infos.length;) {
                    const alt = infos[j];
                    if (EntityInfo.covers(current, alt)) {
                        infos.splice(j, 1);
                    } else {
                        ++j;
                    }
                }
            }
        }

        return entityToInfo;
    }

    private expandEntity(entry: any, metaData: any, op: string, propertyName: Partial<EntityInfo>, turn: number, text: string, entityToInfo: NormalizedEntityInfos): void {
        const name: string = entry.name;
        if (!name.startsWith('$')) {
            const values = entry.value;
            const instances = metaData && metaData[name];
            for (let i = 0; i < values.length; ++i) {
                const val = values[i];
                const instance = instances && instances[i];
                const infos = entityToInfo && entityToInfo[name] || [];
                entityToInfo[name] = infos;

                const info: Partial<EntityInfo> = {
                    whenRecognized: turn,
                    name: name,
                    value: val,
                    operation: op
                };

                if (instance) {
                    info.start = instance.startIndex || 0;
                    info.end = instance.endIndex || 0;
                    info.text = instance.text || '';
                    info.type = instance.type;
                    info.role = instance.role;
                    info.score = instance.score || 0.0;
                }

                // Eventually this could be passed in
                info.priority = info.role ? 0 : 1;
                info.coverage = (info.end - info.start) / text.length;
                if (propertyName) {
                    // Add property information to entities
                    if (propertyName.start < info.start) {
                        info.start = propertyName.start;
                    }

                    if (propertyName.end > info.end) {
                        info.end = propertyName.end;
                    }

                    // Expand entity to include possible property names
                    for (const property in propertyName.value) {
                        const newInfo: Partial<EntityInfo> = Object.assign({}, info);
                        newInfo.property = property;
                        infos.push(newInfo);
                    }
                }
                else {
                    if (op && name == this.propertyNameKey) {
                        for(const property in val)
                        {
                            const newInfo: Partial<EntityInfo> = Object.assign({}, info);
                            newInfo.property = property;
                            infos.push(newInfo);
                        }
                    }
                    else {
                        infos.push(info);
                    }
                }
            }
        }
    }

    private candidates(entities: NormalizedEntityInfos, expected: string[]): Partial<EntityAssignment>[] {
        const candidates: Partial<EntityAssignment>[] = [];
        const globalExpectedOnly: string[] = this.dialogSchema.schema[this.expectedOnlyKey] || [];
        const usedEntityType = new Set<string>([this.utteranceKey]);
        const usedEntity: Map<string, Partial<EntityInfo>> = new Map();

        // Emit entities that already have a property
        for (const entityName in entities) {
            const alternatives = entities[entityName];
            for (const alternative of alternatives) {
                if (alternative.property) {
                    usedEntity.set(alternative.name, alternative);
                    candidates.push({
                        entity: alternative,
                        property: alternative.property,
                        operation: alternative.operation,
                        isExpected: expected.indexOf(alternative.property) >= 0
                    });
                }
            }
        }

        // Find possible mappings to properties
        for (const propSchema of this.dialogSchema.property.children) {
            const isExpected = expected.indexOf(propSchema.name) >= 0;
            const expectedOnly = propSchema.expectedOnly || globalExpectedOnly;
            for (const entityName of propSchema.entities) {
                const matches = entities[entityName];
                if (matches && (isExpected || expectedOnly.indexOf(entityName) < 0)) {
                    usedEntityType.add(entityName);
                    for (const entity of matches) {
                        if (!usedEntity.has(entity.name)) {
                            candidates.push({
                                entity: entity,
                                property: propSchema.name,
                                operation: entity.operation,
                                isExpected: isExpected
                            });
                        }
                    }
                }
            }
        }

        // Unassigned entities
        const entityPreferences = this.entityPreferences(null);
        for (const key in entities) {
            if (!usedEntityType.has(key) && entityPreferences.indexOf(key) >= 0) {
                for (const entity of entities[key]) {
                    if (!usedEntity.has(entity.name)) {
                        candidates.push({
                            entity: entity,
                            operation: entity.operation,
                            property: entity.property
                        });
                    }
                }
            }
        }

        return candidates;
    }

    private addMapping(mapping: Partial<EntityAssignment>, assignments: EntityAssignments): void {
        // Entities without a property or operation are available as entities only when found
        if (mapping.property || mapping.operation) {
            if (mapping.alternative) {
                mapping.event = AdaptiveEvents.chooseProperty;
            } else if (Array.isArray(mapping.entity.value)) {
                const arr = mapping.entity.value;
                if (arr.length > 1) {
                    mapping.event = AdaptiveEvents.chooseEntity;
                } else {
                    mapping.event = AdaptiveEvents.assignEntity;
                    mapping.entity.value = arr[0];
                }
            } else {
                mapping.event = AdaptiveEvents.assignEntity;
            }

            assignments.assignments.push(mapping);
        }
    }

    private entityPreferences(property: string): string[] {
        if (!property) {
            if (this.dialogSchema.schema && this.dialogSchema.schema.hasOwnProperty(this.entitiesKey)) {
                return this.dialogSchema.schema[this.entitiesKey];
            } else {
                return [this.propertyNameKey];
            }
        } else {
            return this.dialogSchema.pathToSchema(property).entities;
        }
    }

    private defaultOperation(assignment: Partial<EntityAssignment>, askDefault: any, dialogDefault: any): string {
        let operation: string;
        if (askDefault) {
            operation = askDefault[assignment.entity.name] || askDefault[''];
        } else if (dialogDefault) {
            const entities = dialogDefault[assignment.property] || dialogDefault[''];
            if (entities) {
                const dialogOp = entities[assignment.entity.name] || entities[''];
                if (dialogOp) {
                    operation = dialogOp;
                }
            }
        }

        return operation;
    }

    private removeOverlappingPerProperty(candidates: Partial<EntityAssignment>[]): Partial<EntityAssignment>[] {
        // Group mappings by property
        const perProperty = candidates.reduce<{ [path: string]: Partial<EntityAssignment>[] }>((accumulator, assignment): {} => {
            if (accumulator.hasOwnProperty(assignment.property)) {
                accumulator[assignment.property].push(assignment);
            } else {
                accumulator[assignment.property] = [assignment];
            }
            return accumulator;
        }, {});

        const output: Partial<EntityAssignment>[] = [];
        for (const path in perProperty) {
            const entityPreferences = this.entityPreferences(path);
            let choices = perProperty[path];

            // Assume preference by order listed in mappings
            // Alternatives would be to look at coverage or other metrics
            for (const entity of entityPreferences) {
                let candidate: Partial<EntityAssignment>;
                do {
                    candidate = undefined;
                    for (let i = 0; i < choices.length; i++) {
                        const mapping = choices[i];
                        if (mapping.entity.name == entity) {
                            candidate = mapping;
                            break;
                        }
                    }

                    if (candidate) {
                        // Remove any overlapping entities
                        choices = choices.filter((choice): boolean => !EntityInfo.overlaps(choice.entity, candidate.entity));
                        output.push(candidate);
                    }

                } while (candidate);
            }
        }

        return output;
    }

    private assignEntities(actionContext: ActionContext, entities: NormalizedEntityInfos, existing: EntityAssignments, lastEvent: string): Partial<EntityInfo>[] {
        const assignments = new EntityAssignments();
        const expected: string[] = actionContext.state.getValue(DialogPath.expectedProperties, []);

        // default operation from the last Ask action.
        const askDefaultOp = actionContext.state.getValue(DialogPath.defaultOperation);

        // default operation from the current adaptive dialog.
        const defaultOp = this.dialogSchema.schema && this.dialogSchema.schema[this.defaultOperationKey];

        const nextAssignment = existing.nextAssignment;
        let candidates = this.removeOverlappingPerProperty(this.candidates(entities, expected))
            .sort((a, b): number => (a.isExpected === b.isExpected) ? 0 : (a.isExpected ? -1 : 1));
        const usedEntities: Map<string, Partial<EntityInfo>> = new Map();
        const expectedChoices: string[] = [];
        let choices: Partial<EntityAssignment>[] = [];
        while (candidates.length > 0) {
            let candidate = candidates[0];

            // Find alternatives for current entity and remove from candidates pool.
            let alternatives: Partial<EntityAssignment>[] = [];
            const remaining: Partial<EntityAssignment>[] = [];
            candidates.forEach((alt): void => {
                if (EntityInfo.overlaps(candidate.entity, alt.entity)) {
                    alternatives.push(alt);
                } else {
                    remaining.push(alt);
                }
            });
            candidates = remaining;

            // If expected binds entity, drop unexpected alternatives
            if (candidate.isExpected && candidate.entity.name != this.utteranceKey) {
                alternatives = alternatives.filter((a): boolean => a.isExpected);
            }

            // Find alternative that covers the largest amount of utterance
            candidate = alternatives.sort((a, b): number => {
                return (b.entity.name === this.utteranceKey ? 0 : b.entity.end - b.entity.start) -
                    (a.entity.name === this.utteranceKey ? 0 : a.entity.end - a.entity.start);
            })[0];

            // Remove all alternatives that are fully contained in largest
            alternatives = alternatives.filter((a): boolean => !EntityInfo.covers(candidate.entity, a.entity));

            // Process any disambiguation task.
            let mapped = false;
            if (lastEvent == AdaptiveEvents.chooseEntity && candidate.property == nextAssignment.property) {
                // Property has resolution so remove entity ambiguity
                existing.dequeue(actionContext);
                lastEvent = undefined;
            } else if (lastEvent == AdaptiveEvents.chooseProperty && !candidate.operation && candidate.entity.name == this.propertyNameKey) {
                // NOTE: This assumes the existence of an entity named PROPERTYName for resolving this ambiguity
                // See if one of the choices corresponds to an alternative
                choices = existing.nextAssignment.alternatives;
                const property = Array.isArray(candidate.entity.value) ? candidate.entity.value[0] : candidate.entity.value.toString();
                const choice = choices.find((p): boolean => p.property == property);
                if (choice) {
                    // Resolve choice, pretend it was expected and add to assignments
                    choice.isExpected = true;
                    choice.alternative = undefined;
                    expectedChoices.push(choice.property);
                    this.addMapping(choice, assignments);
                    choices = choices.filter((c): boolean => !EntityInfo.overlaps(c, choice.entity));
                    mapped = true;
                }
            }

            for (const alternative of alternatives) {
                if (!alternative.operation) {
                    alternative.operation = this.defaultOperation(alternative, askDefaultOp, defaultOp);
                }
            }

            candidate.addAlternatives(alternatives);

            if (!mapped) {
                this.addMapping(candidate, assignments);
            }
        }

        if (expectedChoices.length > 0) {
            // When choosing between property assignments, make the assignments be expected.
            actionContext.state.setValue(DialogPath.expectedProperties, expectedChoices);

            // Add back in any non-overlapping choices
            while (choices.length > 0) {
                const choice = choices[0];
                const overlaps = choices.filter((alt): boolean => !EntityInfo.overlaps(choice.entity, alt.entity));
                choice.addAlternatives(overlaps);
                this.addMapping(choice, assignments);
                choices = choices.filter((c): boolean => !EntityInfo.overlaps(c.entity, choice.entity));
            }

            existing.dequeue(actionContext);
        }

        this.mergeAssignments(assignments, existing);
        return Object.values(usedEntities);
    }

    private replaces(a: Partial<EntityAssignment>, b: Partial<EntityAssignment>): number {
        let replaces = 0;
        for (const aAlt of a.alternatives) {
            for (const bAlt of b.alternatives) {
                if (aAlt.property == bAlt.property && aAlt.entity.name != this.propertyNameKey && bAlt.entity.name != this.propertyNameKey) {
                    var prop = this.dialogSchema.pathToSchema(aAlt.property);
                    if (Array.isArray(prop)) {
                        if (aAlt.entity.whenRecognized > bAlt.entity.whenRecognized) {
                            replaces = -1;
                        } else if (aAlt.entity.whenRecognized < bAlt.entity.whenRecognized) {
                            replaces = 1;
                        } else {
                            replaces = 0;
                        }
                        if (replaces == 0) {
                            if (aAlt.entity.start > bAlt.entity.start) {
                                replaces = -1;
                            } else if (aAlt.entity.start > bAlt.entity.start) {
                                replaces = 1;
                            } else {
                                replaces = 0;
                            }
                        }

                        if (replaces != 0) {
                            break;
                        }
                    }
                }
            }
        }

        return replaces;
    }

    private mergeAssignments(newAssignments: EntityAssignments, old: EntityAssignments): void {
        let list = old.assignments;
        for (const assign of newAssignments.assignments) {
            // Only one outstanding operation per singleton property
            let add = true;
            const newList: Partial<EntityAssignment>[] = [];
            for (const oldAssign of list) {
                let keep = true;
                if (add) {
                    switch (this.replaces(assign, oldAssign)) {
                        case -1:
                            keep = false;
                            break;
                        case 1:
                            add = false;
                            break;
                    }
                }

                if (keep) {
                    newList.push(oldAssign);
                }
            }

            if (add) {
                newList.push(assign);
            }

            list = newList;
        }

        old.assignments = list;

        const operationPreference: string[] = this.dialogSchema.schema && this.dialogSchema.schema[this.operationsKey] || [];
        const eventPreference: string[] = [AdaptiveEvents.assignEntity, AdaptiveEvents.chooseProperty, AdaptiveEvents.chooseEntity];
        list.sort((a, b): number => {
            // Order by event
            let comparison = 0;

            if (eventPreference.indexOf(a.event) != eventPreference.indexOf(b.event)) {
                comparison = eventPreference.indexOf(a.event) > eventPreference.indexOf(b.event) ? 1 : -1;
            } else {
                // Unexpected before expected
                if (a.isExpected != b.isExpected) {
                    comparison = a.isExpected ? 1 : -1;
                } else {
                    // Order by history
                    if (a.entity.whenRecognized != b.entity.whenRecognized) {
                        comparison = a.entity.whenRecognized > b.entity.whenRecognized ? 1 : -1;
                    } else {
                        // Order by operations
                        if (operationPreference.indexOf(a.operation) != operationPreference.indexOf(b.operation)) {
                            comparison = operationPreference.indexOf(a.operation) > operationPreference.indexOf(b.operation) ? 1 : -1;
                        }
                    }
                }
            }

            return comparison;
        });
    }
}
