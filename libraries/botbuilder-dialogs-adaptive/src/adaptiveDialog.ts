/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { 
    TurnContext, BotTelemetryClient, NullTelemetryClient, ActivityTypes, 
    RecognizerResult
} from 'botbuilder-core';
import { 
    Dialog, DialogInstance, DialogReason, DialogTurnResult, DialogTurnStatus, DialogEvent,
    DialogContext, StateMap, DialogConfiguration
} from 'botbuilder-dialogs';
import { 
    AdaptiveEventNames, SequenceContext, StepChangeList, StepChangeType, AdaptiveDialogState 
} from './sequenceContext';
import { Rule } from './rules';
import { Recognizer } from './recognizers';
import { DialogContainer } from 'botbuilder-dialogs/lib/dialogContainer';

export interface AdaptiveDialogConfiguration extends DialogConfiguration {
    /**
     * (Optional) planning rules to evaluate for each conversational turn.
     */
    rules?: Rule[];

    /**
     * (Optional) recognizer used to analyze any message utterances.
     */
    recognizer?: Recognizer;

    /**
     * (Optional) steps to initialize the dialogs plan with.
     */
    steps?: Dialog[];
}

export class AdaptiveDialog<O extends object = {}> extends DialogContainer<O> {
    private readonly changeKey = Symbol('changes');
    private readonly recognizedKey = Symbol('recognized');

    private installedDependencies = false;

    /**
     * Creates a new `AdaptiveDialog` instance.
     * @param dialogId (Optional) unique ID of the component within its parents dialog set.
     * @param steps (Optional) steps to initialize the dialogs plan with.
     */
    constructor(dialogId?: string, steps?: Dialog[]) {
        super(dialogId);
        if (Array.isArray(steps)) { Array.prototype.push.apply(this.steps, steps) }
    }

    /**
     * Planning rules to evaluate for each conversational turn.
     */
    public readonly rules: Rule[] = [];

    /**
     * Steps to initialize the dialogs plan with.
     */
    public readonly steps: Dialog[] = [];

    /**
     * (Optional) recognizer used to analyze any message utterances.
     */
    public recognizer?: Recognizer;

    /**
     * (Optional) flag that determines whether the dialog automatically ends when the plan is out
     * of steps. Defaults to `false` for the root dialog and `true` for child dialogs.
     */
    public autoEndDialog?: boolean;

    public set telemetryClient(client: BotTelemetryClient) {
        super.telemetryClient = client ? client : new NullTelemetryClient();
        this.dialogs.telemetryClient = client;
    }

    public addRule(rule: Rule): this {
        this.rules.push(rule);
        return this;
    }

    protected onInstallDependencies(): void {
        // Install any steps
        this.steps.forEach((step) => this.dialogs.add(step));

        // Install each rules steps
        this.rules.forEach((rule) => {
            rule.steps.forEach((step) => this.dialogs.add(step));
        });
    }

    //---------------------------------------------------------------------------------------------
    // Base Dialog Overrides
    //---------------------------------------------------------------------------------------------

    protected onComputeID(): string {
        return `adaptive[${this.bindingPath()}]`;
    }
   
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        const sequence = this.toSequenceContext(dc);

        // Install dependencies on first access
        if (!this.installedDependencies) {
            this.installedDependencies = true;
            this.onInstallDependencies();
        }
        
        // Persist options to dialog state
        const state: AdaptiveDialogState<O> = dc.activeDialog.state;
        state.options = options || {} as O;

        // Initialize 'result' with any initial value
        if (state.options.hasOwnProperty('value')) {
            const value = options['value'];
            const clone = Array.isArray(value) || typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : value;
            state.result = clone;
        }

        // Evaluate rules and queue up plan changes
        await this.processEvent(sequence, { name: AdaptiveEventNames.beginDialog, value: options, bubble: false });
        
        // Run plan
        return await this.continuePlan(sequence);
    }

    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        const sequence = this.toSequenceContext(dc);
    }

    public async onDialogEvent(dc: DialogContext, event: DialogEvent): Promise<boolean> {
        const sequence = this.toSequenceContext(dc);

        // Process event and queue up any potential interruptions 
        const handled = await this.processEvent(sequence, event);
        
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
        // Forward to current sequence step
        const state = instance.state as AdaptiveDialogState<O>;
        const plan = state.plan;
        if (plan && plan.steps.length > 0) {
            // We need to mockup a DialogContext so that we can call repromptDialog() for the active step 
            const stepDC: DialogContext = new DialogContext(this.dialogs, context, plan.steps[0], new StateMap({}), new StateMap({}));
            await stepDC.repromptDialog();
        }
    }

    public createChildContext(dc: DialogContext): DialogContext | undefined {
        const state: AdaptiveDialogState<O> = dc.activeDialog.state;
        if (Array.isArray(state.steps) && state.steps.length > 0) {
            const step = new SequenceContext(this.dialogs, dc, state.steps[0], state.steps, this.changeKey);
            step.parent = dc;
            return step;
        } else {
            return undefined;
        }
    }

    public configure(config: AdaptiveDialogConfiguration): this {
        return super.configure(this);
    }
 
    //---------------------------------------------------------------------------------------------
    // Event Processing
    //---------------------------------------------------------------------------------------------

    protected async processEvent(sequence: SequenceContext, event: DialogEvent): Promise<boolean> {
        let handled = await this.queueFirstMatch(sequence, event);
        if (!handled) {
            switch (event.name) {
            case AdaptiveEventNames.beginDialog:
            case AdaptiveEventNames.continueDialog:
                // Dispatch activityReceived event
                handled = await this.processEvent(sequence, { name: AdaptiveEventNames.activityReceived, value: undefined, bubble: false }, continuing);
                break;
            
                if (this.steps.length > 0) {
                    // Initialize plan with steps
                    const changes: StepChangeList = {
                        changeType: StepChangeType.insertSteps,
                        steps: []
                    };
                    this.steps.forEach((step) => {
                        changes.steps.push({
                            dialogId: step.id,
                            dialogStack: []
                        });
                    });
                    sequence.queueChanges(changes);
                    handled = true;
                } else {
                }
                break;
            case AdaptiveEventNames.consultDialog:
                // Dispatch activityReceived event
                handled = await this.processEvent(sequence, { name: AdaptiveEventNames.activityReceived, value: undefined, bubble: false });
                break;
            case AdaptiveEventNames.activityReceived:
                const activity = sequence.context.activity;
                if (activity.type === ActivityTypes.Message) {
                    // Recognize utterance
                    const recognized = await this.onRecognize(sequence.context);

                    // Dispatch utteranceRecognized event
                    handled = await this.processEvent(sequence, { name: AdaptiveEventNames.recognizedIntent, value: recognized, bubble: false });
                } else if (activity.type === ActivityTypes.Event) {
                    // Dispatch named event that was received
                    handled = await this.processEvent(sequence, { name: activity.name, value: activity.value, bubble: false });
                }
                break;
            case AdaptiveEventNames.recognizedIntent:
                // Emit utteranceRecognized event
                handled = await this.queueFirstMatch(sequence, event);
                if (!handled) {
                    // Dispatch fallback event
                    handled = await this.processEvent(sequence, { name: AdaptiveEventNames.unknownIntent, value: event.value, bubble: false });
                }
                break;
            case AdaptiveEventNames.unknownIntent:
                if (!sequence.hasPlans) {
                    // Emit fallback event
                    handled = await this.queueFirstMatch(sequence, event);
                }
                break;
            default:
                // Emit event received
                handled = await this.queueFirstMatch(sequence, event);
            }
        }

        return handled;
    }

    /**
     * Ends the active step for the current sequence.
     */
    public async endCurrentStep(sequence: SequenceContext): Promise<boolean> {
        if (sequence.steps.length > 0) {
            sequence.steps.shift();
            if (sequence.steps.length == 0) {
                return await sequence.emitEvent(AdaptiveEventNames.sequenceEnded, undefined, false);
            }
        }

        return false;
    }

    protected async onRecognize(context: TurnContext): Promise<RecognizerResult> {
        const { text, value } = context.activity;
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
            let topIntent: string;
            let topScore = -1;
            const recognized = await this.recognizer.recognize(context);
            for (const key in recognized.intents) {
                if (recognized.intents.hasOwnProperty(key)) {
                    if (topIntent == undefined) {
                        topIntent = key;
                        topScore = recognized.intents[key].score;
                    } else if (recognized.intents[key].score > topScore) {
                        delete recognized.intents[topIntent];
                        topIntent = key;
                        topScore = recognized.intents[key].score;
                    } else {
                        delete recognized.intents[key];
                    }
                }
            }

            return recognized;
        } else {
            return noneIntent;
        }
    }

    private async queueFirstMatch(sequence: SequenceContext, event: DialogEvent): Promise<boolean> {
        const memory = this.getMemoryForEvent(sequence, event);
        for (let i = 0; i < this.rules.length; i++) {
            const changes = await this.rules[i].evaluate(sequence, event, memory);
            if (changes && changes.length > 0) {
                changes[0].turnState = memory.turn;
                sequence.queueChanges(changes[0]);
                return true;
            }
        }

        return false;
    }
    //---------------------------------------------------------------------------------------------
    // Plan Execution
    //---------------------------------------------------------------------------------------------

    protected async consultPlan(planning: SequenceContext): Promise<DialogConsultation|undefined> {
        // Apply any queued up changes
        await planning.applyChanges();

        // Get a unique instance ID for the current stack entry.
        // - We need to do this because things like cancellation can cause us to be removed
        //   from the stack and we want to detect this so we can stop processing steps.
        const instanceId = this.getUniqueInstanceId(planning);

        // Delegate consultation to any active planning step
        const step = this.createChildContext(planning) as AdaptiveContext<O e
        if (step) {
            const consultation = await step.consultDialog();
            return {
                desire: consultation ? consultation.desire : DialogConsultationDesire.canProcess,
                processor: async (dc) => {
                    // Continue current step
                    console.log(`running step: ${step.plan.steps[0].dialogId}`);
                    let result = consultation ? await consultation.processor(step) : { status: DialogTurnStatus.empty };
                    if (result.status == DialogTurnStatus.empty && !result.parentEnded) {
                        const nextStep = step.plan.steps[0];
                        result = await step.beginDialog(nextStep.dialogId, nextStep.options);
                    }

                    // Process step results
                    if (!result.parentEnded && this.getUniqueInstanceId(planning) === instanceId) {
                        // End the current step
                        if (result.status != DialogTurnStatus.waiting) {
                            // This can potentially trigger new changes being queued up
                            await planning.endStep();
                        }

                        // Do we have any queued up changes?
                        if (planning.changes.length > 0) {
                            // Apply changes and continue execution
                            return await this.continuePlan(planning);
                        }

                        // Is step waiting?
                        if (result.status === DialogTurnStatus.waiting) {
                            return result;
                        }

                        // Continue plan execution
                        const plan = planning.plan;
                        if (plan && plan.steps.length > 0 && plan.steps[0].dialogStack && plan.steps[0].dialogStack.length > 0) {
                            // Tell step to re-prompt
                            await this.repromptDialog(dc.context, dc.activeDialog);
                            return { status: DialogTurnStatus.waiting };
                        } else {
                            return await this.continuePlan(planning);
                        }
                    } else {
                        // Remove parent ended flag and return result.
                        if (result.parentEnded) { delete result.parentEnded };
                        return result;
                    }
                }
            }
        } else {
            return undefined;
        }
    }

    protected async continuePlan(sequence: SequenceContext): Promise<DialogTurnResult> {
        // Consult plan and execute returned processor
        try {
            const consultation = await this.consultPlan(sequence);
            if (consultation) {
                return await consultation.processor(sequence);
            } else {
                return await this.onEndOfPlan(sequence);
            }
        } catch (err) {
            return await sequence.cancelAllDialogs('error', { message: err.message, stack: err.stack });
        }
    }

    protected async onEndOfPlan(planning: SequenceContext): Promise<DialogTurnResult> {
        // End dialog and return result
        if (planning.activeDialog) {
            if (this.shouldEnd(planning)) {
                const state: AdaptiveDialogState<O> = planning.activeDialog.state;
                return await planning.endDialog(state.result);
            } else {
                return Dialog.EndOfTurn;
            }
        } else {
            return { status: DialogTurnStatus.cancelled };
        }
    }

    private getUniqueInstanceId(dc: DialogContext): string {
        return dc.stack.length > 0 ? `${dc.stack.length}:${dc.activeDialog.id}` : '';
    }

    private getMemoryForEvent(dc: DialogContext, event: DialogEvent): DialogContextVisibleState {
        // Add event value fields to turn state
        const memory = dc.state.toJSON();
        if (typeof event.value == 'object') {
            memory.turn = Object.assign({}, memory.turn, event.value);
        }

        return memory;
    }

    private shouldEnd(dc: DialogContext): boolean {
        if (this.autoEndDialog == undefined) {
            return (dc.parent != null);
        } else {
            return this.autoEndDialog;
        }
    }

    private toSequenceContext(dc: DialogContext): SequenceContext<O> {
        const state: AdaptiveDialogState<O> = dc.activeDialog.state;
        const sequence = new AdaptiveContext<O edialogs, dc, { dialogStack: dc.stack }, state);
        sequence.parent = dc.parent;
        return planning;
    }
}
