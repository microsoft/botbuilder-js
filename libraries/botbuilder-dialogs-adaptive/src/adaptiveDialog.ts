/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {
    TurnContext, BotTelemetryClient, NullTelemetryClient, ActivityTypes,
    Activity, RecognizerResult, getTopScoringIntent
} from 'botbuilder-core';
import { Dialog, DialogInstance, DialogReason, DialogTurnResult, DialogTurnStatus, DialogEvent, DialogContext, DialogContainer, DialogDependencies, TurnPath, DialogPath, DialogState } from 'botbuilder-dialogs';
import { OnCondition } from './conditions';
import { Recognizer } from './recognizers';
import { TriggerSelector } from './triggerSelector';
import { FirstSelector } from './selectors';
import { SchemaHelper } from './schemaHelper';
import { LanguageGenerator } from './languageGenerator';
import { ActionContext } from './actionContext';
import { EntityEvents } from './entityEvents';
import { AdaptiveEvents } from './adaptiveEvents';
import { AdaptiveDialogState } from './adaptiveDialogState';
import { EntityInfo } from './entityInfo';
import { IntExpression } from 'adaptive-expressions';

export class AdaptiveDialog<O extends object = {}> extends DialogContainer<O> {
    public static conditionTracker = 'dialog._tracker.conditions';

    private readonly adaptiveKey = '_adaptive';
    private readonly generatorTurnKey = Symbol('generatorTurn');
    private readonly changeTurnKey = Symbol('changeTurn');

    private installedDependencies = false;
    private needsTracker = false;
    private dialogSchema: SchemaHelper;

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

    public set telemetryClient(client: BotTelemetryClient) {
        super.telemetryClient = client ? client : new NullTelemetryClient();
        this.dialogs.telemetryClient = client;
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

    protected onComputeId(): string {
        return `AdaptiveDialog[]`;
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        this.onPushScopedServices(dc.context);
        try {
            // Install dependencies on first access
            this.ensureDependenciesInstalled();

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
                this.triggers.forEach((trigger) => {
                    if (trigger.runOnce && trigger.condition) {
                        const references = trigger.condition.toExpression().references();
                        var paths = dcState.trackPaths(references);
                        var triggerPath = `${ AdaptiveDialog.conditionTracker }.${ trigger.id }.`;
                        dcState.setValue(triggerPath + 'paths', paths);
                        dcState.setValue(triggerPath + 'lastRun', 0);
                    }
                });
            }

            // Initialize dialog state
            if (options) {
                // Replace initial activeDialog.State with clone of options
                dc.activeDialog.state = JSON.parse(JSON.stringify(options));
            }
            dc.activeDialog.state[this.adaptiveKey] = {};

            // Evaluate events and queue up action changes
            const event: DialogEvent = { name: AdaptiveEvents.beginDialog, value: options, bubble: false };
            await this.onDialogEvent(dc, event);

            // Continue action execution
            return await this.continueActions(dc);
        } finally {
            this.onPopScopedServices(dc.context);
        }
    }

    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        this.onPushScopedServices(dc.context);
        try {
            this.ensureDependenciesInstalled();

            // Continue action execution
            return await this.continueActions(dc);
        } finally {
            this.onPopScopedServices(dc.context);
        }
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
        // Containers are typically leaf nodes on the stack but the dev is free to push other dialogs
        // on top of the stack which will result in the container receiving an unexpected call to
        // resumeDialog() when the pushed on dialog ends.
        // To avoid the container prematurely ending we need to implement this method and simply
        // ask our inner dialog stack to re-prompt.
        await this.repromptDialog(dc.context, dc.activeDialog);

        return Dialog.EndOfTurn;
    }

    public async repromptDialog(turnContext: TurnContext, instance: DialogInstance): Promise<void> {
        try {
            this.onPushScopedServices(turnContext);
            // Forward to current sequence action
            const state: AdaptiveDialogState = instance.state[this.adaptiveKey];
            if (state && state.actions && state.actions.length > 0) {
                // We need to mockup a DialogContext so that we can call repromptDialog() for the active action
                const actionDC: DialogContext = new DialogContext(this.dialogs, turnContext, state.actions[0]);
                await actionDC.repromptDialog();
            }
        } finally {
            this.onPopScopedServices(turnContext);
        }
    }

    public createChildContext(dc: DialogContext): DialogContext {
        const activeDialogState = dc.activeDialog.state;
        let state: AdaptiveDialogState = activeDialogState[this.adaptiveKey];
        if (!state) {
            state = { actions: [] };
        }

        if (state.actions && state.actions.length > 0) {
            return new DialogContext(this.dialogs, dc, state.actions[0]);
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
                        const recognized = await this.onRecognize(actionContext, activity);
                        // TODO figure out way to not use turn state to pass this value back to caller.
                        actionContext.state.setValue(TurnPath.recognized, recognized);
                        handled = true;
                    }
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

    protected async onRecognize(dc: DialogContext, activity: Activity): Promise<RecognizerResult> {
        const { text, value } = activity;
        const noneIntent: RecognizerResult = {
            text: text || '',
            intents: { 'None': { score: 0.0 } },
            entities: {}
        };

        // Check for submission of an adaptive card
        if (!text && typeof value == 'object' && typeof value['intent'] == 'string') {
            // Map submitted values to a recognizer result
            const recognized: RecognizerResult = {
                text: '',
                intents: {},
                entities: {}
            };
            for (const key in value) {
                if (value.hasOwnProperty(key)) {
                    if (key == 'intent') {
                        recognized.intents[value[key]] = { score: 1.0 };
                    } else {
                        recognized.entities[key] = [value[key]];
                    }
                }
            }

            return recognized;
        } else if (this.recognizer) {
            // Call recognizer as normal and filter to top intent
            const recognized = await this.recognizer.recognize(dc, activity);
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

        try {
            this.onPushScopedServices(dc.context);

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
        } finally {
            this.onPopScopedServices(dc.context);
        }

        return await this.onEndOfActions(actionContext);
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
            // Completed actions so continue processing entity queues
            const handled = await this.processQueues(actionContext);
            if (handled) {
                // Still processing queues
                return await this.continueActions(actionContext);
            } else if (this.shouldEnd(actionContext)) {
                const result = actionContext.state.getValue(this.defaultResultProperty);
                return await actionContext.endDialog(result);
            }
            return Dialog.EndOfTurn;
        }
        return { status: DialogTurnStatus.cancelled };
    }

    protected onPushScopedServices(context: TurnContext): void {
        if (this.generator) {
            context.turnState.push('LanguageGenerator', this.generator);
        }
    }

    protected onPopScopedServices(context: TurnContext): void {
        if (this.generator) {
            context.turnState.pop('LanguageGenerator');
        }
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
     * This function goes through the ambiguity queues and emits events if present.
     * In order ClearProperties, AssignEntity, ChooseProperties, ChooseEntity, EndOfActions.
     */
    private async processQueues(actionContext: ActionContext): Promise<boolean> {
        let evt: DialogEvent;
        const queues = EntityEvents.read(actionContext);
        let changed = false;
        if (queues.clearProperties.length > 0) {
            const val = queues.clearProperties.shift();
            evt = {
                name: AdaptiveEvents.clearProperty,
                value: val,
                bubble: false
            };
            changed = true;
        } else if (queues.assignEntities.length > 0) {
            const val = queues.assignEntities.shift();
            evt = {
                name: AdaptiveEvents.assignEntity,
                value: val,
                bubble: false
            };
            // TODO: (from C#) For now, I'm going to dereference to a one-level array value.  There is a bug in the current code in the distinction between
            // @ which is supposed to unwrap down to non-array and @@ which returns the whole thing. @ in the curent code works by doing [0] which
            // is not enough.
            let entity = val.entity.value;
            if (!(Array.isArray(entity))) {
                entity = [entity];
            }

            actionContext.state.setValue(`${ TurnPath.recognized }.entities.${ val.entity.name }`, entity);
            changed = true;
        } else if (queues.chooseProperties.length > 0) {
            const val = queues.chooseProperties.shift();
            evt = {
                name: AdaptiveEvents.chooseProperty,
                value: val,
                bubble: false
            };
        } else if (queues.chooseEntities.length > 0) {
            const val = queues.chooseEntities.shift();
            evt = {
                name: AdaptiveEvents.chooseEntity,
                value: val,
                bubble: false
            };
        } else {
            evt = {
                name: AdaptiveEvents.endOfActions,
                bubble: false
            };
        }

        if (changed) {
            EntityEvents.write(actionContext, queues);
        }

        actionContext.state.setValue(DialogPath.lastEvent, evt.name);
        let handled = await this.processEvent(actionContext, evt, true);
        if (!handled) {
            // If event wasn't handled, remove it from queues and keep going if things changed
            if (EntityEvents.dequeueEvent(queues, evt.name)) {
                EntityEvents.write(actionContext, queues);
                handled = await this.processQueues(actionContext);
            }
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

            const queues = EntityEvents.read(actionContext);
            const entities = EntityInfo.normalizeEntities(actionContext);
            const utterance = activity.type == ActivityTypes.Message ? activity.text : '';
            const expected: string[] = actionContext.state.getValue(DialogPath.expectedProperties, []);

            // Utterance is a special entity that corresponds to the full utterance
            entities['utterance'] = [Object.assign(new EntityInfo(), {
                priority: Number.MAX_SAFE_INTEGER,
                coverage: 1,
                start: 0,
                end: utterance.length,
                name: 'utterance',
                score: 0,
                type: 'string',
                value: utterance,
                text: utterance
            })];
            const recognized = EntityEvents.assignEntities(queues, actionContext, entities, expected, lastEvent, this.dialogSchema);
            const unrecognized = this.splitUtterance(utterance, recognized);

            // TODO: Is this actually useful information?
            actionContext.state.setValue(TurnPath.unrecognizedText, unrecognized);
            actionContext.state.setValue(TurnPath.recognizedEntities, recognized);
            const turn = actionContext.state.getValue(DialogPath.eventCounter);
            EntityEvents.combineOldEntityToProperties(queues, turn, this.dialogSchema);
            EntityEvents.write(actionContext, queues);
        }
    }

    private splitUtterance(utterance: string, recognized: Partial<EntityInfo>[]): string[] {
        const unrecognized = [];
        var current = 0;
        for (let i = 0; i < recognized.length; i++){
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
}
