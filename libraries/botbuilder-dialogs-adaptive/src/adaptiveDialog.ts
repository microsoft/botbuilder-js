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
import {
    Dialog, DialogInstance, DialogReason, DialogTurnResult, DialogTurnStatus, DialogEvent,
    DialogContext, DialogContainer, DialogDependencies, TurnPath, DialogPath
} from 'botbuilder-dialogs';
import { Extensions } from 'adaptive-expressions';
import {
    AdaptiveEvents, SequenceContext, AdaptiveDialogState, ActionState
} from './sequenceContext';
import { OnCondition } from './conditions';
import { Recognizer } from './recognizers';
import { TriggerSelector } from './triggerSelector';
import { FirstSelector } from './selectors';
import { SchemaHelper } from './schemaHelper';
import { LanguageGenerator } from './languageGenerator';

export class AdaptiveDialog<O extends object = {}> extends DialogContainer<O> {

    public static declarativeType = 'Microsoft.AdaptiveDialog';
    public static conditionTracker = 'dialog._tracker.conditions';
    
    private readonly adaptiveKey = '_adaptive';
    private readonly generatorTurnKey = Symbol('generatorTurn');
    private readonly changeKey = Symbol('changes');

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

    public get schema(): object|undefined {
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
                trigger.priority = id.toString();
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
                        const references = Extensions.references(trigger.condition.toExpression());
                        var paths = dcState.trackPaths(references);
                        var triggerPath = `${AdaptiveDialog.conditionTracker}.${trigger.id}.`;
                        dcState.setValue(triggerPath + "paths", paths);
                        dcState.setValue(triggerPath + "lastRun", 0);
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
        const sequence = this.toSequenceContext(dc);

        // Process event and queue up any potential interruptions
        return await this.processEvent(sequence, event, true);
    }

    protected async onPostBubbleEvent(dc: DialogContext, event: DialogEvent): Promise<boolean> {
        const sequence = this.toSequenceContext(dc);

        // Process event and queue up any potential interruptions
        return await this.processEvent(sequence, event, false);
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

    public async repromptDialog(context: TurnContext, instance: DialogInstance): Promise<void> {
        this.onPushScopedServices(context);
        try {
            // Forward to current sequence action
            const actions = this.getActions(instance);
            if (actions.length > 0) {
                // We need to mockup a DialogContext so that we can call repromptDialog() for the active action
                const actionDC: DialogContext = new DialogContext(this.dialogs, context, actions[0]);
                await actionDC.repromptDialog();
            }
        } finally {
            this.onPopScopedServices(context);
        }
    }

    public createChildContext(parent: DialogContext): DialogContext | undefined {
        const actions = this.getActions(parent.activeDialog);
        if (actions.length > 0) {
            if (!Array.isArray(actions[0].dialogStack)) { actions[0].dialogStack = []; }
            return SequenceContext.create(parent, this.dialogs, actions[0].dialogStack, actions, this.changeKey);
        } else {
            return undefined;
        }
    }

    public getDependencies(): Dialog[] {
        this.ensureDependenciesInstalled();
        return [];
    }

    //---------------------------------------------------------------------------------------------
    // Event Processing
    //---------------------------------------------------------------------------------------------

    protected async processEvent(sequence: SequenceContext, event: DialogEvent, preBubble: boolean): Promise<boolean> {
        const dcState = sequence.state;

        // Save into turn
        dcState.setValue(TurnPath.dialogEvent, event);

        this.ensureDependenciesInstalled();

        // Count of events processed
        var count = dcState.getValue(DialogPath.eventCounter);
        dcState.setValue(DialogPath.eventCounter, ++count);
        
        // Look for triggered rule
        let handled = await this.queueFirstMatch(sequence);
        if (handled) {
            return true;
        }

        // Perform default processing
        let activity: Partial<Activity>;
        if (preBubble) {
            switch (event.name) {
                case AdaptiveEvents.beginDialog:
                    if (!sequence.state.getValue(TurnPath.activityProcessed)) {
                        const activityReceivedEvent: DialogEvent = {
                            name: AdaptiveEvents.activityReceived,
                            value: sequence.context.activity,
                            bubble: false
                        };
                        handled = await this.processEvent(sequence, activityReceivedEvent, true);
                    }
                    break;
                case AdaptiveEvents.activityReceived:
                    activity = event.value; // WAS sequence.context.activity;
                    if (activity.type === ActivityTypes.Message) {
                        // Recognize utterance
                        const recognizeUtteranceEvent: DialogEvent = {
                            name: AdaptiveEvents.recognizeUtterance,
                            value: event.value, // WAS sequence.context.activity,
                            bubble: false
                        };
                        await this.processEvent(sequence, recognizeUtteranceEvent, true);

                        // Emit leading RecognizedIntent event
                        const recognized = sequence.state.getValue<RecognizerResult>(TurnPath.recognized);
                        const recognizedIntentEvent: DialogEvent = {
                            name: AdaptiveEvents.recognizedIntent,
                            value: recognized,
                            bubble: false
                        }
                        this.processEntities(sequence);
                        handled = await this.processEvent(sequence, recognizedIntentEvent, true);
                    }

                    // Has an interruption occurred?
                    // - Setting this value to true causes any running inputs to re-prompt when they're
                    //   continued.  The developer can clear this flag if they want the input to instead
                    //   process the users utterance when its continued.
                    if (handled) {
                        sequence.state.setValue(TurnPath.interrupted, true);
                    }
                    break;
                case AdaptiveEvents.recognizeUtterance:
                    activity = event.value; // WAS sequence.context.activity;
                    if (activity.type == ActivityTypes.Message) {
                        // Recognize utterance
                        const recognized = await this.onRecognize(sequence, activity);
                        sequence.state.setValue(TurnPath.recognized, recognized);

                        // Get top scoring intent
                        const { intent, score } = getTopScoringIntent(recognized);
                        sequence.state.setValue(TurnPath.topIntent, intent);
                        sequence.state.setValue(DialogPath.lastIntent, intent);
                        sequence.state.setValue(TurnPath.topScore, score);
                        handled = true;
                    }
                    break;
            }
        } else {
            switch (event.name) {
                case AdaptiveEvents.beginDialog:
                    if (!sequence.state.getValue(TurnPath.activityProcessed)) {
                        const activityReceivedEvent: DialogEvent = {
                            name: AdaptiveEvents.activityReceived,
                            value: sequence.context.activity,
                            bubble: false
                        };
                        // Emit trailing ActivityReceived event
                        handled = await this.processEvent(sequence, activityReceivedEvent, false);
                    }
                    break;
                case AdaptiveEvents.activityReceived:
                    activity = event.value; // WAS sequence.context.activity;
                    if (activity.type === ActivityTypes.Message) {
                        // Do we have an empty sequence?
                        if (sequence.actions.length == 0) {
                            const unknownIntentEvent: DialogEvent = {
                                name: AdaptiveEvents.unknownIntent,
                                bubble: false
                            };
                            // Emit trailing UnknownIntent event
                            handled = await this.processEvent(sequence, unknownIntentEvent, false);
                        } else {
                            handled = false;
                        }
                    }

                    // Has an interruption occurred?
                    // - Setting this value to true causes any running inputs to re-prompt when they're
                    //   continued.  The developer can clear this flag if they want the input to instead
                    //   process the users utterance when its continued.
                    if (handled) {
                        sequence.state.setValue(TurnPath.interrupted, true);
                    }
                    break;
            }
        }

        return handled;
    }

    protected async onRecognize(dc: DialogContext, activity: Partial<Activity>): Promise<RecognizerResult> {
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
            const recognized = await this.recognizer.recognize(dc);
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

    private async queueFirstMatch(sequenceContext: SequenceContext): Promise<boolean> {
        const selection = await this.selector.select(sequenceContext);
        if (selection.length > 0) {
            const evt = this.triggers[selection[0]];
            const changes = await evt.execute(sequenceContext);
            if (changes && changes.length > 0) {
                sequenceContext.queueChanges(changes[0]);
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
        const sequence = this.toSequenceContext(dc);
        await sequence.applyChanges();

        // Get a unique instance ID for the current stack entry.
        // - We need to do this because things like cancellation can cause us to be removed
        //   from the stack and we want to detect this so we can stop processing actions.
        const instanceId = this.getUniqueInstanceId(sequence);

        // Create context for active action
        const action = this.createChildContext(sequence) as SequenceContext;
        if (action) {
            // Continue current action
            console.log(`running action: ${ action.actions[0].dialogId }`);
            let result = await action.continueDialog();

            // Start action if not continued
            if (result.status == DialogTurnStatus.empty && this.getUniqueInstanceId(sequence) == instanceId) {
                const nextAction = action.actions[0];
                result = await action.beginDialog(nextAction.dialogId, nextAction.options);
            }

            // Increment turns action count
            // - This helps dialogs being resumed from an interruption to determine if they
            //   should re-prompt or not.
            const actionCount = sequence.state.getValue('turn.actionCount');
            sequence.state.setValue('turn.actionCount', typeof actionCount == 'number' ? actionCount + 1 : 1);

            // Is the action waiting for input or were we cancelled?
            if (result.status == DialogTurnStatus.waiting || this.getUniqueInstanceId(sequence) != instanceId) {
                return result;
            }

            // End current action
            await this.endCurrentAction(sequence);

            // Execute next action
            // - We call continueDialog() on the root dialog to ensure any changes queued up
            //   by the previous actions are applied.
            let root: DialogContext = sequence;
            while (root.parent) {
                root = root.parent;
            }
            return await root.continueDialog();
        } else {
            return await this.onEndOfActions(sequence);
        }
    }

    protected async endCurrentAction(sequence: SequenceContext): Promise<boolean> {
        if (sequence.actions.length > 0) {
            sequence.actions.shift();
        }

        return false;
    }

    protected async onEndOfActions(sequence: SequenceContext): Promise<DialogTurnResult> {
        // End dialog and return result
        if (sequence.activeDialog) {
            if (this.shouldEnd(sequence)) {
                const result = sequence.state.getValue(this.defaultResultProperty);
                return await sequence.endDialog(result);
            }
            return Dialog.EndOfTurn;
        } else {
            return { status: DialogTurnStatus.cancelled };
        }
    }

    protected onPushScopedServices(context: TurnContext): void {
        if (this.generator) {
            context.pushTurnState('LanguageGenerator', this.generator);
        }
        if (this.recognizer) {
            context.pushTurnState('Recognizer', this.recognizer);
        }
    }

    protected onPopScopedServices(context: TurnContext): void {
        if (this.generator) {
            context.popTurnState('LanguageGenerator');
        }
        if (this.recognizer) {
            context.popTurnState('Recognizer');
        }
    }

    private getUniqueInstanceId(dc: DialogContext): string {
        return dc.stack.length > 0 ? `${ dc.stack.length }:${ dc.activeDialog.id }` : '';
    }

    private shouldEnd(dc: DialogContext): boolean {
        return this.autoEndDialog;
    }

    private toSequenceContext(dc: DialogContext): SequenceContext<O> {
        return SequenceContext.clone(dc, this.getActions(dc.activeDialog), this.changeKey);
    }

    private getActions(instance: DialogInstance): ActionState[] {
        const state: AdaptiveDialogState<O> = instance.state[this.adaptiveKey];
        return state && Array.isArray(state.actions) ? state.actions : [];
    }

    /**
     * Process entities to identify ambiguity and possible assigment to properties.  Broadly the steps are:
     * Normalize entities to include meta-data
     * Check to see if an entity is in response to a previous ambiguity event
     * Assign entities to possible properties
     * Merge new queues into existing queues of ambiguity events
    */
    private processEntities(sequence: SequenceContext): void {
        /*
        const dcState = sequence.state;

        if (this.dialogSchema)
        {
            if (dcState.TryGetValue<string>(DialogPath.LastEvent, out var lastEvent))
            {
                dcState.RemoveValue(DialogPath.LastEvent);
            }

            var queues = EntityEvents.Read(context);
            var entities = NormalizeEntities(context);
            var utterance = context.Context.Activity?.AsMessageActivity()?.Text;
            if (!dcState.TryGetValue<string[]>(DialogPath.ExpectedProperties, out var expected))
            {
                expected = new string[0];
            }

            // Utterance is a special entity that corresponds to the full utterance
            entities["utterance"] = new List<EntityInfo> { new EntityInfo { Priority = int.MaxValue, Coverage = 1.0, Start = 0, End = utterance.Length, Name = "utterance", Score = 0.0, Type = "string", Value = utterance, Text = utterance } };
            var recognized = AssignEntities(context, entities, expected, queues, lastEvent);
            var unrecognized = SplitUtterance(utterance, recognized);

            // TODO: Is this actually useful information?
            dcState.SetValue(TurnPath.UNRECOGNIZEDTEXT, unrecognized);
            dcState.SetValue(TurnPath.RECOGNIZEDENTITIES, recognized);
            var turn = dcState.GetValue<uint>(DialogPath.EventCounter);
            CombineOldEntityToProperties(queues, turn);
            queues.Write(context);
        }
        */
    }

}
