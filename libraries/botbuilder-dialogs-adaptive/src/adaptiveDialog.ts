/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { BoolExpression, BoolExpressionConverter, IntExpression } from 'adaptive-expressions';
import {
    Activity,
    ActivityTypes,
    getTopScoringIntent,
    RecognizerResult,
    StringUtils,
    TurnContext,
    telemetryTrackDialogView,
} from 'botbuilder';

import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContainer,
    DialogContext,
    DialogDependencies,
    DialogEvent,
    DialogInstance,
    DialogPath,
    DialogReason,
    DialogSet,
    DialogState,
    DialogTurnResult,
    DialogTurnStatus,
    Recognizer,
    TurnPath,
} from 'botbuilder-dialogs';
import cloneDeep from 'lodash/cloneDeep';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import { ActionContext } from './actionContext';
import { AdaptiveDialogState } from './adaptiveDialogState';
import { AdaptiveEvents } from './adaptiveEvents';
import { OnCondition, OnIntent } from './conditions';
import { DialogSetConverter, LanguageGeneratorConverter, RecognizerConverter } from './converters';
import { EntityAssignment } from './entityAssignment';
import { EntityAssignmentComparer } from './entityAssignmentComparer';
import { EntityAssignments } from './entityAssignments';
import { EntityInfo, NormalizedEntityInfos } from './entityInfo';
import { LanguageGenerator } from './languageGenerator';
import { languageGeneratorKey } from './languageGeneratorExtensions';
import { BoolProperty } from './properties';
import { RecognizerSet } from './recognizers';
import { ValueRecognizer } from './recognizers/valueRecognizer';
import { SchemaHelper } from './schemaHelper';
import { FirstSelector, MostSpecificSelector } from './selectors';
import { TriggerSelector } from './triggerSelector';
import { TelemetryLoggerConstants } from './telemetryLoggerConstants';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isDialogDependencies(val: any): val is DialogDependencies {
    return typeof ((val as unknown) as DialogDependencies).getDependencies === 'function';
}

export interface AdaptiveDialogConfiguration extends DialogConfiguration {
    recognizer?: string | Recognizer;
    generator?: string | LanguageGenerator;
    triggers?: OnCondition[];
    autoEndDialog?: BoolProperty;
    selector?: TriggerSelector;
    defaultResultProperty?: string;
    schema?: unknown;
    dialogs?: string[] | Dialog[] | DialogSet;
}

/**
 * The Adaptive Dialog models conversation using events and events to adapt dynamically to changing conversation flow.
 */
export class AdaptiveDialog<O extends object = {}> extends DialogContainer<O> implements AdaptiveDialogConfiguration {
    static $kind = 'Microsoft.AdaptiveDialog';
    static conditionTracker = 'dialog._tracker.conditions';

    private readonly adaptiveKey = '_adaptive';
    private readonly defaultOperationKey = '$defaultOperation';
    private readonly expectedOnlyKey = '$expectedOnly';
    private readonly entitiesKey = '$entities';
    private readonly instanceKey = '$instance';
    private readonly operationsKey = '$operations';
    private readonly requiresValueKey = '$requiresValue';
    private readonly propertyNameKey = 'PROPERTYName';
    private readonly propertyEnding = 'Property';
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
     *
     * @param dialogId (Optional) unique ID of the component within its parents dialog set.
     */
    constructor(dialogId?: string) {
        super(dialogId);
    }

    /**
     * Optional. Recognizer used to analyze any message utterances.
     */
    recognizer?: Recognizer;

    /**
     * Optional. Language Generator override.
     */
    generator?: LanguageGenerator;

    /**
     * Trigger handlers to respond to conditions which modify the executing plan.
     */
    triggers: OnCondition[] = [];

    /**
     * Whether to end the dialog when there are no actions to execute.
     *
     * @remarks
     * If true, when there are no actions to execute, the current dialog will end.
     * If false, when there are no actions to execute, the current dialog will simply end the turn and still be active.
     * Defaults to a value of true.
     */
    autoEndDialog: BoolExpression = new BoolExpression(true);

    /**
     * Optional. The selector for picking the possible events to execute.
     */
    selector: TriggerSelector;

    /**
     * The property to return as the result when the dialog ends when there are no more Actions and `AutoEndDialog = true`.
     *
     * @remarks
     * Defaults to a value of `dialog.result`.
     */
    defaultResultProperty = 'dialog.result';

    /**
     * Sets the JSON Schema for the dialog.
     */
    set schema(value: object) {
        this.dialogSchema = new SchemaHelper(value);
    }

    /**
     * Gets the JSON Schema for the dialog.
     *
     * @returns The dialog schema.
     */
    get schema(): object {
        return this.dialogSchema ? this.dialogSchema.schema : undefined;
    }

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof AdaptiveDialogConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'recognizer':
                return RecognizerConverter;
            case 'generator':
                return new LanguageGeneratorConverter();
            case 'autoEndDialog':
                return new BoolExpressionConverter();
            case 'dialogs':
                return DialogSetConverter;
            default:
                return super.getConverter(property);
        }
    }

    /**
     * @protected
     * Ensures all dependencies for the class are installed.
     */
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
            if (isDialogDependencies(trigger)) {
                trigger.getDependencies().forEach((child) => this.dialogs.add(child));
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
            // Default to MostSpecificSelector
            const selector = new MostSpecificSelector();
            selector.selector = new FirstSelector();
            this.selector = selector;
        }
        this.selector.initialize(this.triggers, true);
    }

    //---------------------------------------------------------------------------------------------
    // Base Dialog Overrides
    //---------------------------------------------------------------------------------------------

    /**
     * @protected
     * Gets the internal version string.
     * @returns Internal version string.
     */
    protected getInternalVersion(): string {
        if (!this._internalVersion) {
            // change the container version if any dialogs are added or removed.
            let version = this.dialogs.getVersion();

            // change version if the schema has changed.
            if (this.schema) {
                version += JSON.stringify(this.schema);
            }

            // change if triggers type/constraint change
            this.triggers.forEach((trigger): void => {
                version += trigger.getExpression().toString();
            });

            this._internalVersion = StringUtils.hash(version);
        }

        return this._internalVersion;
    }

    protected onComputeId(): string {
        return 'AdaptiveDialog[]';
    }

    /**
     * Called when the dialog is started and pushed onto the dialog stack.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param options Optional, initial information to pass to the dialog.
     * @returns A Promise representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
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
                    const paths = dcState.trackPaths(references);
                    const triggerPath = `${AdaptiveDialog.conditionTracker}.${trigger.id}.`;
                    dcState.setValue(triggerPath + 'paths', paths);
                    dcState.setValue(triggerPath + 'lastRun', 0);
                }
            });
        }

        dc.activeDialog.state[this.adaptiveKey] = {};

        const properties: { [key: string]: string } = {
            DialogId: this.id,
            Kind: 'Microsoft.AdaptiveDialog',
            context: TelemetryLoggerConstants.DialogStartEvent,
        };
        this.telemetryClient.trackEvent({
            name: TelemetryLoggerConstants.GeneratorResultEvent,
            properties: properties,
        });
        telemetryTrackDialogView(this.telemetryClient, this.id);

        // Evaluate events and queue up action changes
        const event: DialogEvent = { name: AdaptiveEvents.beginDialog, value: options, bubble: false };
        await this.onDialogEvent(dc, event);

        // Continue action execution
        return await this.continueActions(dc);
    }

    /**
     * Called when the dialog is _continued_, where it is the active dialog and the
     * user replies with a new activity.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @returns A Promise representing the asynchronous operation.
     */
    async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        await this.checkForVersionChange(dc);

        this.ensureDependenciesInstalled();

        // Continue action execution
        return await this.continueActions(dc);
    }

    /**
     * Called when the dialog is ending.
     *
     * @param turnContext The context object for this turn.
     * @param instance State information associated with the instance of this dialog on the dialog stack.
     * @param reason Reason why the dialog ended.
     * @returns A Promise representing the asynchronous operation.
     */
    async endDialog(turnContext: TurnContext, instance: DialogInstance, reason: DialogReason): Promise<void> {
        const properties: { [key: string]: string } = {
            DialogId: this.id,
            Kind: 'Microsoft.AdaptiveDialog',
        };
        if (reason === DialogReason.cancelCalled) {
            this.telemetryClient.trackEvent({
                name: TelemetryLoggerConstants.GeneratorResultEvent,
                properties: { ...properties, context: TelemetryLoggerConstants.DialogCancelEvent },
            });
        } else if (reason === DialogReason.endCalled) {
            this.telemetryClient.trackEvent({
                name: TelemetryLoggerConstants.GeneratorResultEvent,
                properties: { ...properties, context: TelemetryLoggerConstants.CompleteEvent },
            });
        }
        await super.endDialog(turnContext, instance, reason);
    }

    /**
     * @protected
     * Called before an event is bubbled to its parent.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param event The [DialogEvent](xref:botbuilder-dialogs.DialogEvent) being raised.
     * @returns Whether the event is handled by the current dialog and further processing should stop.
     */
    protected async onPreBubbleEvent(dc: DialogContext, event: DialogEvent): Promise<boolean> {
        const actionContext = this.toActionContext(dc);

        // Process event and queue up any potential interruptions
        return await this.processEvent(actionContext, event, true);
    }

    /**
     * @protected
     * Called after an event was bubbled to all parents and wasn't handled.
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param event The [DialogEvent](xref:botbuilder-dialogs.DialogEvent) being raised.
     * @returns Whether the event is handled by the current dialog and further processing should stop.
     */
    protected async onPostBubbleEvent(dc: DialogContext, event: DialogEvent): Promise<boolean> {
        const actionContext = this.toActionContext(dc);

        // Process event and queue up any potential interruptions
        return await this.processEvent(actionContext, event, false);
    }

    /**
     * Called when a child dialog completed its turn, returning control to this dialog.
     *
     * @param dc The dialog context for the current turn of the conversation.
     * @param _reason Reason why the dialog resumed.
     * @param _result Optional, value returned from the dialog that was called.
     * The type of the value returned is dependent on the child dialog.
     * @returns A Promise representing the asynchronous operation.
     */
    async resumeDialog(dc: DialogContext, _reason?: DialogReason, _result?: any): Promise<DialogTurnResult> {
        await this.checkForVersionChange(dc);

        // Containers are typically leaf nodes on the stack but the dev is free to push other dialogs
        // on top of the stack which will result in the container receiving an unexpected call to
        // resumeDialog() when the pushed on dialog ends.
        // To avoid the container prematurely ending we need to implement this method and simply
        // ask our inner dialog stack to re-prompt.
        await this.repromptDialog(dc.context, dc.activeDialog);

        return Dialog.EndOfTurn;
    }

    /**
     * Reprompts the user.
     *
     * @param context The context object for the turn.
     * @param instance Current state information for this dialog.
     * @returns A Promise representing the asynchronous operation.
     */
    async repromptDialog(context: DialogContext | TurnContext, instance: DialogInstance): Promise<void> {
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

    /**
     * Creates a child [DialogContext](xref:botbuilder-dialogs.DialogContext) for the given context.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @returns The child [DialogContext](xref:botbuilder-dialogs.DialogContext) or null if no [AdaptiveDialogState.actions](xref:botbuilder-dialogs-adaptive.AdaptiveDialogState.actions) are found for the given context.
     */
    createChildContext(dc: DialogContext): DialogContext {
        const activeDialogState = dc.activeDialog.state;
        const state: AdaptiveDialogState = activeDialogState[this.adaptiveKey];
        if (!state) {
            activeDialogState[this.adaptiveKey] = { actions: [] };
        } else if (state.actions?.length > 0) {
            const childContext = new DialogContext(this.dialogs, dc, state.actions[0]);
            this.onSetScopedServices(childContext);
            return childContext;
        }

        return undefined;
    }

    /**
     * Gets [Dialog](xref:botbuilder-dialogs.Dialog) enumerated dependencies.
     *
     * @returns [Dialog](xref:botbuilder-dialogs.Dialog)'s enumerated dependencies.
     */
    getDependencies(): Dialog[] {
        this.ensureDependenciesInstalled();
        return [];
    }

    //---------------------------------------------------------------------------------------------
    // Event Processing
    //---------------------------------------------------------------------------------------------

    /**
     * @protected
     * Event processing implementation.
     * @param actionContext The [ActionContext](xref:botbuilder-dialogs-adaptive.ActionContext) for the current turn of conversation.
     * @param dialogEvent The [DialogEvent](xref:botbuilder-dialogs.DialogEvent) being raised.
     * @param preBubble A flag indicator for preBubble processing.
     * @returns A Promise representation of a boolean indicator or the result.
     */
    protected async processEvent(
        actionContext: ActionContext,
        dialogEvent: DialogEvent,
        preBubble: boolean
    ): Promise<boolean> {
        // Save into turn
        actionContext.state.setValue(TurnPath.dialogEvent, dialogEvent);

        let activity = actionContext.state.getValue<Activity>(TurnPath.activity);

        // some dialogevents get promoted into turn state for general access outside of the dialogevent.
        // This allows events to be fired (in the case of ChooseIntent), or in interruption (Activity)
        // Triggers all expressed against turn.recognized or turn.activity, and this mapping maintains that
        // any event that is emitted updates those for the rest of rule evaluation.
        switch (dialogEvent.name) {
            case AdaptiveEvents.recognizedIntent: {
                // we have received a RecognizedIntent event
                // get the value and promote to turn.recognized, topintent, topscore and lastintent
                const recognizedResult = actionContext.state.getValue<RecognizerResult>(
                    `${TurnPath.dialogEvent}.value`
                );
                const { intent, score } = getTopScoringIntent(recognizedResult);
                actionContext.state.setValue(TurnPath.recognized, recognizedResult);
                actionContext.state.setValue(TurnPath.topIntent, intent);
                actionContext.state.setValue(TurnPath.topScore, score);
                actionContext.state.setValue(DialogPath.lastIntent, intent);

                // process entities for ambiguity processing (We do this regardless of who handles the event)
                this.processEntities(actionContext, activity);
                break;
            }
            case AdaptiveEvents.activityReceived:
                // we received an ActivityReceived event, promote the activity into turn.activity
                actionContext.state.setValue(TurnPath.activity, dialogEvent.value);
                activity = dialogEvent.value as Activity;
                break;
        }

        this.ensureDependenciesInstalled();

        // Count of events processed
        let count = actionContext.state.getValue(DialogPath.eventCounter);
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
                            bubble: false,
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
                            bubble: false,
                        };
                        await this.processEvent(actionContext, recognizeUtteranceEvent, true);

                        // Emit leading RecognizedIntent event
                        const recognized = actionContext.state.getValue<RecognizerResult>(TurnPath.recognized);
                        const recognizedIntentEvent: DialogEvent = {
                            name: AdaptiveEvents.recognizedIntent,
                            value: recognized,
                            bubble: false,
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
                    if (activity.type === ActivityTypes.Message) {
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
                            bubble: false,
                        };
                        // Emit trailing ActivityReceived event
                        handled = await this.processEvent(actionContext, activityReceivedEvent, false);
                    }
                    break;
                case AdaptiveEvents.activityReceived:
                    if (activity.type === ActivityTypes.Message) {
                        // Do we have an empty sequence?
                        if (actionContext.actions.length === 0) {
                            const unknownIntentEvent: DialogEvent = {
                                name: AdaptiveEvents.unknownIntent,
                                bubble: false,
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

    /**
     * @protected
     * Recognizes intent for current activity given the class recognizer set, if set is null no intent will be recognized.
     * @param actionContext The [ActionContext](xref:botbuilder-dialogs-adaptive.ActionContext) for the current turn of conversation.
     * @param activity [Activity](xref:botbuilder-schema.Activity) to recognize.
     * @returns A Promise representing a [RecognizerResult](xref:botbuilder.RecognizerResult).
     */
    protected async onRecognize(actionContext: ActionContext, activity: Activity): Promise<RecognizerResult> {
        const { text } = activity;
        const noneIntent: RecognizerResult = {
            text: text ?? '',
            intents: { None: { score: 0.0 } },
            entities: {},
        };

        if (this.recognizer) {
            if (this._recognizerSet.recognizers.length === 0) {
                this._recognizerSet.recognizers.push(this.recognizer);
                this._recognizerSet.recognizers.push(new ValueRecognizer());
            }
            const recognized = await this._recognizerSet.recognize(actionContext, activity);

            const intents = Object.entries(recognized.intents);

            if (intents.length > 0) {
                // Score
                // Gathers all the intents with the highest Score value.
                const scoreSorted = intents.sort(([, a], [, b]) => b.score - a.score);
                const [[, firstItemScore]] = scoreSorted;
                const topIntents = scoreSorted.filter(([, e]) => e.score == firstItemScore.score);

                // Priority
                // Gathers the Intent with the highest Priority (0 being the highest).
                // Note: this functionality is based on the FirstSelector.SelectAsync method.
                let [topIntent] = topIntents;

                if (topIntents.length > 1) {
                    let highestPriority = Number.MAX_SAFE_INTEGER;
                    for (const [key, intent] of topIntents) {
                        const [triggerIntent] = this.triggers.filter((x) => x instanceof OnIntent && x.intent == key);
                        const priority = triggerIntent.currentPriority(actionContext);
                        if (priority >= 0 && priority < highestPriority) {
                            topIntent = [key, intent];
                            highestPriority = priority;
                        }
                    }
                }

                const [key, value] = topIntent;
                recognized.intents = { [key]: value };
            }
            return recognized;
        } else {
            return noneIntent;
        }
    }

    private async queueFirstMatch(actionContext: ActionContext): Promise<boolean> {
        const selection: OnCondition[] = await this.selector.select(actionContext);
        if (selection.length > 0) {
            const evt = selection[0];
            const properties: { [key: string]: string } = {
                DialogId: this.id,
                Expression: evt.getExpression().toString(),
                Kind: `Microsoft.${evt.constructor.name}`,
                ConditionId: evt.id,
                context: TelemetryLoggerConstants.TriggerEvent,
            };
            this.telemetryClient.trackEvent({
                name: TelemetryLoggerConstants.GeneratorResultEvent,
                properties: properties,
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

    /**
     * @protected
     * Waits for pending actions to complete and moves on to [OnEndOfActions](xref:botbuilder-dialogs-adaptive.OnEndOfActions).
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @returns A Promise representation of [DialogTurnResult](xref:botbuilder-dialogs.DialogTurnResult).
     */
    protected async continueActions(dc: DialogContext): Promise<DialogTurnResult> {
        // Apply any queued up changes
        const actionContext = this.toActionContext(dc);
        await actionContext.applyChanges();

        // Get a unique instance ID for the current stack entry.
        // - We need to do this because things like cancellation can cause us to be removed
        //   from the stack and we want to detect this so we can stop processing actions.
        const instanceId = this.getUniqueInstanceId(actionContext);

        // Initialize local interruption detection
        // Any steps containing a dialog stack after the first step indicates the action was interrupted.
        // We want to force a re-prompt and then end the turn when we encounter an interrupted step.
        let interrupted = false;

        // Create context for active action
        let actionDC = this.createChildContext(actionContext);
        while (actionDC) {
            let result: DialogTurnResult<unknown>;
            if (actionDC.stack.length === 0) {
                // Start step
                const nextAction = actionContext.actions[0];
                result = await actionDC.beginDialog(nextAction.dialogId, nextAction.options);
            } else {
                // Set interrupted flag only if it is undefined
                if (interrupted && actionDC.state.getValue<boolean>(TurnPath.interrupted) === undefined) {
                    actionDC.state.setValue(TurnPath.interrupted, true);
                }

                // Continue step execution
                result = await actionDC.continueDialog();
            }

            // Is the step waiting for input or were we cancelled?
            if (result.status === DialogTurnStatus.waiting || this.getUniqueInstanceId(actionContext) !== instanceId) {
                return result;
            }

            // End current step
            await this.endCurrentAction(actionContext);

            if (result.status === DialogTurnStatus.completeAndWait) {
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
            interrupted = true;
        }

        return await this.onEndOfActions(actionContext);
    }

    /**
     * @protected
     * Provides the ability to set scoped services for the current [DialogContext](xref:botbuilder-dialogs.DialogContext).
     * @param dialogContext The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     */
    protected onSetScopedServices(dialogContext: DialogContext): void {
        if (this.generator) {
            dialogContext.services.set(languageGeneratorKey, this.generator);
        }
    }

    /**
     * @protected
     * Removes the most current action from the given [ActionContext](xref:botbuilder-dialogs-adaptive.ActionContext) if there are any.
     * @param actionContext The [ActionContext](xref:botbuilder-dialogs-adaptive.ActionContext) for the current turn of conversation.
     * @returns A Promise representing a boolean indicator for the result.
     */
    protected async endCurrentAction(actionContext: ActionContext): Promise<boolean> {
        if (actionContext.actions.length > 0) {
            actionContext.actions.shift();
        }

        return false;
    }

    /**
     * @protected
     * Awaits for completed actions to finish processing entity assignments and finishes the turn.
     * @param actionContext The [ActionContext](xref:botbuilder-dialogs-adaptive.ActionContext) for the current turn of conversation.
     * @returns A Promise representation of [DialogTurnResult](xref:botbuilder-dialogs.DialogTurnResult).
     */
    protected async onEndOfActions(actionContext: ActionContext): Promise<DialogTurnResult> {
        // Is the current dialog still on the stack?
        if (actionContext.activeDialog) {
            // Completed actions so continue processing entity assignments
            const handled = await this.processQueues(actionContext);
            if (handled) {
                // Still processing assignments
                return await this.continueActions(actionContext);
            } else if (this.autoEndDialog.getValue(actionContext.state)) {
                const result = actionContext.state.getValue(this.defaultResultProperty);
                return await actionContext.endDialog(result);
            }
            return Dialog.EndOfTurn;
        }
        return { status: DialogTurnStatus.cancelled };
    }

    private getUniqueInstanceId(dc: DialogContext): string {
        return dc.stack.length > 0 ? `${dc.stack.length}:${dc.activeDialog.id}` : '';
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
     *
     * @param actionContext The ActionContext.
     * @returns true if the event was handled.
     */
    private async processQueues(actionContext: ActionContext): Promise<boolean> {
        let evt: DialogEvent;
        let handled = false;
        const assignments = EntityAssignments.read(actionContext);
        const nextAssignment = assignments.nextAssignment;
        if (nextAssignment) {
            nextAssignment.raisedCount ??= 0;
            if (nextAssignment.raisedCount++ === 0) {
                // Reset retries when new form event is first issued
                actionContext.state.deleteValue(DialogPath.retries);
            }
            evt = {
                name: nextAssignment.event,
                value: nextAssignment.alternative ? nextAssignment.alternatives : nextAssignment,
                bubble: false,
            };

            if (nextAssignment.event === AdaptiveEvents.assignEntity) {
                // TODO: (from C#) For now, I'm going to dereference to a one-level array value.  There is a bug in the current code in the distinction between
                // @ which is supposed to unwrap down to non-array and @@ which returns the whole thing. @ in the curent code works by doing [0] which
                // is not enough.
                let entity = nextAssignment.value.value;
                if (!Array.isArray(entity)) {
                    entity = [entity];
                }

                actionContext.state.setValue(`${TurnPath.recognized}.entities.${nextAssignment.value.name}`, entity);
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
                bubble: false,
            };
            actionContext.state.setValue(DialogPath.lastEvent, evt.name);
            handled = await this.processEvent(actionContext, evt, true);
        }

        return handled;
    }

    /**
     * Process entities to identify ambiguity and possible assignment to properties.  Broadly the steps are:
     * Normalize entities to include meta-data
     * Check to see if an entity is in response to a previous ambiguity event
     * Assign entities to possible properties
     * Merge new queues into existing queues of ambiguity events
     *
     * @param actionContext The ActionContext.
     * @param activity The Activity.
     */
    private processEntities(actionContext: ActionContext, activity: Activity): void {
        if (this.dialogSchema) {
            const lastEvent = actionContext.state.getValue(DialogPath.lastEvent);
            if (lastEvent) {
                actionContext.state.deleteValue(DialogPath.lastEvent);
            }

            const assignments = EntityAssignments.read(actionContext);
            const entities = this.normalizeEntities(actionContext);
            const utterance = activity.type === ActivityTypes.Message ? activity.text : '';

            // Utterance is a special entity that corresponds to the full utterance
            entities[this.utteranceKey] = [
                Object.assign(new EntityInfo(), {
                    priority: Number.MAX_SAFE_INTEGER,
                    coverage: 1,
                    start: 0,
                    end: utterance.length,
                    name: this.utteranceKey,
                    score: 0,
                    type: 'string',
                    value: utterance,
                    text: utterance,
                }),
            ];
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
        let current = 0;
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

    private normalizeEntities(actionContext: ActionContext): Record<string, EntityInfo[]> {
        const entityToInfo = {};
        const text = actionContext.state.getValue(`${TurnPath.recognized}.text`);
        const entities = actionContext.state.getValue(`${TurnPath.recognized}.entities`);
        if (entities) {
            const turn = actionContext.state.getValue(DialogPath.eventCounter);
            const operations: string[] =
                (this.dialogSchema.schema && this.dialogSchema.schema[this.operationsKey]) ?? [];
            const properties = Object.keys(this.dialogSchema?.schema['properties'] ?? {});
            this.expandEntityObject(entities, null, null, null, operations, properties, turn, text, entityToInfo);
        }

        // When there are multiple possible resolutions for the same entity that overlap, pick the
        // one that covers the most of the utterance.
        for (const name in entityToInfo) {
            const infos = entityToInfo[name];
            infos.sort((entity1, entity2): number => {
                let val = 0;
                if (entity1.start === entity2.start) {
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
                for (let j = i + 1; j < infos.length; ) {
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

    private expandEntityObject(
        entities: Record<string, unknown[]>,
        op: string,
        property: string,
        rootInstance: Record<string, unknown>,
        operations: string[],
        properties: string[],
        turn: number,
        text: string,
        entityToInfo: Record<string, EntityInfo[]>
    ): void {
        Object.keys(entities).forEach((entityName) => {
            const instances = entities[this.instanceKey][entityName];
            this.expandEntities(
                entityName,
                entities[entityName],
                instances,
                rootInstance,
                op,
                property,
                operations,
                properties,
                turn,
                text,
                entityToInfo
            );
        });
    }

    // There's a decent amount of type casting in this method and expandEntity() due to the complex
    // nested structure of `entities`. It can be solved by defining types, but the changes necessary to remove the type casting
    // are numerous and it can be argued that it adds complexity to do so.
    private expandEntities(
        name: string,
        entities: unknown[],
        instances: Record<string, unknown>[],
        rootInstance: Record<string, unknown>,
        op: string,
        property: string,
        operations: string[],
        properties: string[],
        turn: number,
        text: string,
        entityToInfo: Record<string, EntityInfo[]>
    ): void {
        if (!name.startsWith('$')) {
            // Entities representing schema properties end in "Property" to prevent name collisions with the property itself.
            const propName = this.stripProperty(name);
            let entityName: string;
            let isOp = false;
            let isProperty = false;
            if (operations.includes(name)) {
                op = name;
                isOp = true;
            } else if (properties.includes(propName)) {
                property = propName;
                isProperty = true;
            } else {
                entityName = name;
            }

            entities.forEach((entity, index) => {
                const instance = instances[index];
                let root = rootInstance;
                if (!root) {
                    // Keep the root entity name and position to help with overlap.
                    root = cloneDeep(instance);
                    root.type = `${name}${index}`;
                }

                if (entityName) {
                    this.expandEntity(
                        entityName,
                        entity as Record<string, unknown[]>,
                        instance,
                        root,
                        op,
                        property,
                        turn,
                        text,
                        entityToInfo
                    );
                } else if (typeof entity === 'object' && entity !== null) {
                    if (isEmpty(entity)) {
                        if (isOp) {
                            // Handle operator with no children.
                            this.expandEntity(op, null, instance, root, op, property, turn, text, entityToInfo);
                        } else if (isProperty) {
                            // Handle property with no children.
                            this.expandEntity(property, null, instance, root, op, property, turn, text, entityToInfo);
                        }
                    } else {
                        this.expandEntityObject(
                            entity as Record<string, unknown[]>,
                            op,
                            property,
                            root,
                            operations,
                            properties,
                            turn,
                            text,
                            entityToInfo
                        );
                    }
                } else if (isOp) {
                    // Handle global operator with no children in model.
                    this.expandEntity(op, null, instance, root, op, property, turn, text, entityToInfo);
                }
            });
        }
    }

    private stripProperty(name: string): string {
        return name.endsWith(this.propertyEnding) ? name.substring(0, name.length - this.propertyEnding.length) : name;
    }

    private expandEntity(
        name: string,
        value: Record<string, unknown> | null,
        instance: Record<string, unknown>,
        rootInstance: Record<string, unknown>,
        op: string,
        property: string,
        turn: number,
        text: string,
        entityToInfo: Record<string, EntityInfo[]>
    ): void {
        if (instance && rootInstance) {
            entityToInfo[name] ??= [];

            const info: EntityInfo = {
                whenRecognized: turn,
                name,
                value,
                operation: op,
                property,
                start: <number>rootInstance.startIndex,
                end: <number>rootInstance.endIndex,
                rootEntity: <string>rootInstance.type,
                text: <string>rootInstance.text ?? '',
                type: <string>instance.type,
                score: <number>instance.score ?? 0,
                priority: 0,
                coverage: undefined,
            };

            info.coverage = (info.end - info.start) / text.length;
            entityToInfo[name].push(info);
        }
    }

    private matchesAssignment(entity: Partial<EntityInfo>, assignment: EntityAssignment): boolean {
        return (
            (!entity.operation || entity.operation === assignment.operation) &&
            (!entity.property || entity.property === assignment.property)
        );
    }

    private candidates(
        entities: NormalizedEntityInfos,
        expected: string[],
        lastEvent: string,
        nextAssignment: EntityAssignment,
        askDefault: Record<string, string>,
        dialogDefault: Record<string, unknown>
    ): EntityAssignment[] {
        const globalExpectedOnly: string[] = this.dialogSchema.schema[this.expectedOnlyKey] ?? [];
        const requiresValue: string[] = this.dialogSchema.schema[this.requiresValueKey] ?? [];
        const assignments: EntityAssignment[] = [];

        // Add entities with a recognized property.
        Object.values(entities).forEach((alternatives) => {
            alternatives.forEach((alternative) => {
                if (alternative.property && (alternative.value || !requiresValue.includes(alternative.operation))) {
                    assignments.push(
                        new EntityAssignment({
                            value: alternative,
                            property: alternative.property,
                            operation: alternative.operation,
                            isExpected: expected.includes(alternative.property),
                        })
                    );
                }
            });
        });

        // Find possible mappings for entities without a property or where property entities are expected.
        this.dialogSchema.property.children.forEach((propSchema) => {
            const isExpected = expected.includes(propSchema.name);
            const expectedOnly = propSchema.expectedOnly ?? globalExpectedOnly;

            for (const propEntity of propSchema.entities) {
                const entityName = this.stripProperty(propEntity);
                if (entities[entityName] && (isExpected || !expectedOnly.includes(entityName))) {
                    for (const entity of entities[entityName]) {
                        if (!entity.property) {
                            assignments.push(
                                new EntityAssignment({
                                    value: entity,
                                    property: propSchema.name,
                                    operation: entity.operation,
                                    isExpected,
                                })
                            );
                        } else if (entity.property === entityName && !entity.value && !entity.operation && isExpected) {
                            // Recast property with no value as match for property entities.
                            assignments.push(
                                new EntityAssignment({
                                    value: entity,
                                    property: propSchema.name,
                                    operation: null,
                                    isExpected,
                                })
                            );
                        }
                    }
                }
            }
        });

        // Add default operations.
        for (const assignment of assignments) {
            if (!assignment.operation) {
                // Assign missing operation.
                if (
                    lastEvent === AdaptiveEvents.chooseEntity &&
                    assignment.value.property === nextAssignment.property
                ) {
                    // Property and value match ambiguous entity.
                    assignment.operation = AdaptiveEvents.chooseEntity;
                    assignment.isExpected = true;
                } else {
                    // Assign default operator.
                    assignment.operation = this.defaultOperation(assignment, askDefault, dialogDefault);
                }
            }
        }

        // Add choose property matches.
        if (lastEvent === AdaptiveEvents.chooseProperty) {
            for (const alternatives of Object.values(entities)) {
                alternatives.forEach((alternative) => {
                    if (!alternative.value) {
                        // If alternative matches one alternative, it answers chooseProperty.
                        const matches = nextAssignment.alternatives.filter((a) =>
                            this.matchesAssignment(alternative, a)
                        );
                        if (matches.length === 1) {
                            assignments.push(
                                new EntityAssignment({
                                    value: alternative,
                                    operation: AdaptiveEvents.chooseProperty,
                                    isExpected: true,
                                })
                            );
                        }
                    }
                });
            }
        }

        // Add pure operations.
        for (const alternatives of Object.values(entities)) {
            alternatives.forEach((alternative) => {
                if (alternative.operation && !alternative.property && !alternative.value) {
                    assignments.push(
                        new EntityAssignment({
                            value: alternative,
                            property: null,
                            operation: alternative.operation,
                            isExpected: false,
                        })
                    );
                }
            });
        }

        // Preserve expectedProperties if there is no property.
        for (const assignment of assignments) {
            if (!assignment.property) {
                assignment.expectedProperties = expected;
            }
        }

        return assignments;
    }

    private addAssignment(assignment: EntityAssignment, assignments: EntityAssignments): void {
        // Entities without a property or operation are available as entities only when found
        if (assignment.property || assignment.operation) {
            if (assignment.alternative) {
                assignment.event = AdaptiveEvents.chooseProperty;
            } else if (Array.isArray(assignment.value.value)) {
                const arr = assignment.value.value;
                if (arr.length > 1) {
                    assignment.event = AdaptiveEvents.chooseEntity;
                } else {
                    assignment.event = AdaptiveEvents.assignEntity;
                    assignment.value.value = arr[0];
                }
            } else {
                assignment.event = AdaptiveEvents.assignEntity;
            }

            assignments.assignments.push(assignment);
        }
    }

    private entityPreferences(property: string): string[] {
        if (!property) {
            if (this.dialogSchema.schema && this.dialogSchema.schema[this.entitiesKey]) {
                return this.dialogSchema.schema[this.entitiesKey];
            } else {
                return [this.propertyNameKey];
            }
        } else {
            return this.dialogSchema.pathToSchema(property).entities;
        }
    }

    private defaultOperation(
        assignment: EntityAssignment,
        askDefault: Record<string, string>,
        dialogDefault: Record<string, unknown>
    ): string {
        let operation: string;
        if (assignment.property) {
            if (askDefault) {
                operation = askDefault[assignment.value.name] ?? askDefault[''];
            } else if (dialogDefault) {
                const entities = dialogDefault[assignment.property] ?? dialogDefault[''];
                let dialogOp;
                if (entities) {
                    dialogOp = entities[assignment.value.name] ?? entities[''];
                } else {
                    dialogOp = dialogDefault[assignment.value.name] ?? dialogDefault[''];
                }
                operation = dialogOp;
            }
        }

        return operation;
    }

    private removeOverlappingPerProperty(candidates: EntityAssignment[]): EntityAssignment[] {
        // Group mappings by property
        const perProperty = candidates.reduce(
            (acc, assignment) => ({
                ...acc,
                [assignment.property]: [...(acc[assignment.property] ?? []), assignment],
            }),
            {}
        );

        const output: EntityAssignment[] = [];
        for (const propChoices in perProperty) {
            if (propChoices != null) {
                const entityPreferences = this.entityPreferences(propChoices);
                let choices = perProperty[propChoices];

                // Assume preference by order listed in mappings
                // Alternatives would be to look at coverage or other metrics
                for (const entity of entityPreferences) {
                    let candidate: EntityAssignment;
                    do {
                        candidate = choices.find((mapping) => mapping.value.name === entity);

                        if (candidate) {
                            // Remove any overlapping entities without a common root.
                            choices = choices.filter(
                                (choice): boolean =>
                                    !isEqual(choice, candidate) ||
                                    (EntityInfo.sharesRoot(choice.value, candidate.value) &&
                                        !EntityInfo.overlaps(choice.value, candidate.value))
                            );
                            output.push(candidate);
                        }
                    } while (candidate);
                }
            }
        }

        return output;
    }

    private assignEntities(
        actionContext: ActionContext,
        entities: NormalizedEntityInfos,
        existing: EntityAssignments,
        lastEvent: string
    ): Partial<EntityInfo>[] {
        const assignments = new EntityAssignments();
        const expected: string[] = actionContext.state.getValue(DialogPath.expectedProperties, []);

        // default operation from the last Ask action.
        const askDefaultOp = actionContext.state.getValue<Record<string, string>>(DialogPath.defaultOperation);

        // default operation from the current adaptive dialog.
        const defaultOp = this.dialogSchema.schema && this.dialogSchema.schema[this.defaultOperationKey];

        const nextAssignment = existing.nextAssignment;
        let candidates = this.removeOverlappingPerProperty(
            this.candidates(entities, expected, lastEvent, nextAssignment, askDefaultOp, defaultOp)
        ).sort((a, b): number => (a.isExpected === b.isExpected ? 0 : a.isExpected ? -1 : 1));

        const usedEntities = new Set(candidates.map((candidate) => candidate.value));
        let expectedChoices: string[] = null;
        let choices: EntityAssignment[] = [];
        while (candidates.length > 0) {
            let candidate = candidates[0];

            // Alternatives are either for the same entity or from different roots.
            const remaining: EntityAssignment[] = [];
            let alternatives: EntityAssignment[] = [];

            for (const alt of candidates) {
                if (
                    EntityInfo.overlaps(candidate.value, alt.value) &&
                    (!EntityInfo.sharesRoot(candidate.value, alt.value) || isEqual(candidate.value, alt.value))
                ) {
                    alternatives.push(alt);
                } else {
                    remaining.push(alt);
                }
            }

            candidates = remaining;
            alternatives.forEach((alternative) => usedEntities.add(alternative.value));

            // If expected binds entity, drop unexpected alternatives unless they have an explicit operation
            if (candidate.isExpected && candidate.value.name !== this.utteranceKey) {
                alternatives = alternatives.filter((a): boolean => a.isExpected && a.operation != null);
            }

            // Find alternative that covers the largest amount of utterance
            candidate = alternatives.sort((a, b): number => {
                return (
                    (b.value.name === this.utteranceKey ? 0 : b.value.end - b.value.start) -
                    (a.value.name === this.utteranceKey ? 0 : a.value.end - a.value.start)
                );
            })[0];

            // Remove all alternatives that are fully contained in largest
            alternatives = alternatives.filter((a): boolean => !EntityInfo.covers(candidate.value, a.value));

            // Process any disambiguation task.
            let mapped = false;
            if (candidate.operation === AdaptiveEvents.chooseEntity) {
                // Property has resolution so remove entity ambiguity.
                const entityChoices = existing.dequeue(actionContext);
                candidate.operation = entityChoices.operation;
                if (Array.isArray(candidate.value?.value) && candidate.value.value?.length > 1) {
                    // Resolve ambiguous response to one of the original choices.
                    const originalChoices = entityChoices.value.value;
                    const intersection = candidate.value.value?.filter((choice) => originalChoices.includes(choice));
                    if (intersection?.length) {
                        candidate.value.value = intersection;
                    }
                }
            } else if (candidate.operation === AdaptiveEvents.chooseProperty) {
                choices = nextAssignment.alternatives;
                const choice = choices.find((a) => this.matchesAssignment(candidate.value, a));
                if (choice) {
                    // Resolve choice, pretend it was expected and add to assignments.
                    expectedChoices = [];
                    choice.isExpected = true;
                    choice.alternative = null;
                    if (choice.property) {
                        expectedChoices.push(choice.property);
                    } else if (choice.expectedProperties) {
                        expectedChoices.concat(choice.expectedProperties);
                    }

                    this.addAssignment(choice, assignments);
                    choices = choices.filter((c) => !EntityInfo.overlaps(c, choice.value));
                    mapped = true;
                }
            }

            candidate.addAlternatives(alternatives);
            if (!mapped) {
                this.addAssignment(candidate, assignments);
            }
        }

        if (expectedChoices !== null) {
            // When choosing between property assignments, make the assignments be expected.
            actionContext.state.setValue(DialogPath.expectedProperties, expectedChoices);

            if (expectedChoices.length) {
                actionContext.state.setValue(DialogPath.expectedProperties, expectedChoices);
            }
            // Add back in any non-overlapping choices that have not been resolved.
            while (choices.length) {
                const choice = choices[0];
                const overlaps = choices.filter((alt) => EntityInfo.overlaps(choice, alt));
                choice.addAlternatives(overlaps);
                this.addAssignment(choice, assignments);
                choices = choices.filter((c): boolean => !EntityInfo.overlaps(c, choice.value));
            }

            existing.dequeue(actionContext);
        }

        const operations = new EntityAssignmentComparer(this.dialogSchema.schema[this.operationsKey] ?? []);
        this.mergeAssignments(assignments, existing, operations);
        return [...usedEntities.values()];
    }

    private replaces(a: EntityAssignment, b: EntityAssignment): number {
        let replaces = 0;
        for (const aAlt of a.alternatives) {
            for (const bAlt of b.alternatives) {
                if (aAlt.property === bAlt.property && aAlt.value?.value && bAlt.value?.value) {
                    const prop = this.dialogSchema.pathToSchema(aAlt.property);
                    if (!Array.isArray(prop)) {
                        if (aAlt.value.whenRecognized > bAlt.value.whenRecognized) {
                            replaces = -1;
                        } else if (aAlt.value.whenRecognized < bAlt.value.whenRecognized) {
                            replaces = 1;
                        } else {
                            replaces = 0;
                        }
                        if (replaces === 0) {
                            if (aAlt.value.start > bAlt.value.start) {
                                replaces = -1;
                            } else if (aAlt.value.start < bAlt.value.start) {
                                replaces = 1;
                            } else {
                                replaces = 0;
                            }
                        }

                        if (replaces !== 0) {
                            break;
                        }
                    }
                }
            }
        }

        return replaces;
    }

    private mergeAssignments(
        newAssignments: EntityAssignments,
        old: EntityAssignments,
        comparer: EntityAssignmentComparer
    ): void {
        let list = old.assignments;
        for (const assign of newAssignments.assignments) {
            // Only one outstanding operation per singleton property
            let add = true;
            const newList: EntityAssignment[] = [];
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
        list.sort((a, b) => comparer.compare(a, b));
    }
}
