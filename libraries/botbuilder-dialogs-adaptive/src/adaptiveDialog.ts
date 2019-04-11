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
    DialogContext, DialogSet, StateMap, DialogConsultation, DialogConsultationDesire, DialogConfiguration, DialogContextVisibleState
} from 'botbuilder-dialogs';
import { 
    RuleDialogEventNames, PlanningContext, RuleDialogState as AdaptiveDialogState, PlanChangeList, PlanChangeType 
} from './planningContext';
import { PlanningRule } from './rules';
import { Recognizer } from './recognizers';

export interface AdaptiveDialogConfiguration extends DialogConfiguration {
    /**
     * (Optional) planning rules to evaluate for each conversational turn.
     */
    rules?: PlanningRule[];

    /**
     * (Optional) recognizer used to analyze any message utterances.
     */
    recognizer?: Recognizer;

    /**
     * (Optional) steps to initialize the dialogs plan with.
     */
    steps?: Dialog[];
}

export class AdaptiveDialog<O extends object = {}> extends Dialog<O> {
    private readonly dialogs: DialogSet = new DialogSet();
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
    public readonly rules: PlanningRule[] = [];

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
    public autoEnd?: boolean;

    public set telemetryClient(client: BotTelemetryClient) {
        super.telemetryClient = client ? client : new NullTelemetryClient();
        this.dialogs.telemetryClient = client;
    }

    public addDialog(...dialogs: Dialog[]): this {
        dialogs.forEach((dialog) => this.dialogs.add(dialog));
        return this;
    }

    public addRule(...rules: PlanningRule[]): this {
        Array.prototype.push.apply(this.rules, rules);
        return this;
    }

    public findDialog(dialogId: string): Dialog | undefined {
        return this.dialogs.find(dialogId);
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
        const state: AdaptiveDialogState<O> = dc.activeDialog.state;

        try {
            // Install dependencies on first access
            if (!this.installedDependencies) {
                this.installedDependencies = true;
                this.onInstallDependencies();
            }
            
            // Persist options to dialog state
            state.options = options || {} as O;

            // Initialize 'result' with any initial value
            if (state.options.hasOwnProperty('value')) {
                const value = options['value'];
                const clone = Array.isArray(value) || typeof value === 'object' ? JSON.parse(JSON.stringify(value)) : value;
                state.result = clone;
            }

            // Create a new planning context
            const planning = PlanningContext.create(dc, state);

            // Evaluate rules and queue up plan changes
            await this.evaluateRules(planning, { name: RuleDialogEventNames.beginDialog, value: options, bubble: false });
            
            // Run plan
            return await this.continuePlan(planning);
        } catch (err) {
            return await dc.cancelAllDialogs('error', { message: err.message, stack: err.stack });
        }
    }

    public async consultDialog(dc: DialogContext): Promise<DialogConsultation> {
        try {
            // Create a new planning context
            const state: AdaptiveDialogState<O> = dc.activeDialog.state;
            const planning = PlanningContext.create(dc, state);

            // First consult plan
            let consultation = await this.consultPlan(planning);
            if (!consultation || consultation.desire != DialogConsultationDesire.shouldProcess) {
                // Next evaluate rules
                const changesQueued = await this.evaluateRules(planning, { name: RuleDialogEventNames.consultDialog, value: undefined, bubble: false });
                if (changesQueued && (!consultation || planning.changes[0].desire == DialogConsultationDesire.shouldProcess)) {
                    consultation = {
                        desire: planning.changes[0].desire,
                        processor: (dc) => this.continuePlan(planning)
                    };
                }

                // Fallback to just continuing the plan
                if (!consultation) {
                    consultation = {
                        desire: DialogConsultationDesire.canProcess,
                        processor: (dc) => this.continuePlan(planning)
                    };
                }
            }

            return consultation;
        } catch (err) {
            return {
                desire: DialogConsultationDesire.shouldProcess,
                processor: (dc) => dc.cancelAllDialogs('error', { message: err.message, stack: err.stack })
            };
        }
    }

    public async onDialogEvent(dc: DialogContext, event: DialogEvent): Promise<boolean> {
        // Create a new planning context
        const state: AdaptiveDialogState<O> = dc.activeDialog.state;
        const planning = PlanningContext.create(dc, state);

        // Evaluate rules and queue up any potential changes 
        return await this.evaluateRules(planning, event);
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

    public configure(config: AdaptiveDialogConfiguration): this {
        return super.configure(this);
    }
 
    //---------------------------------------------------------------------------------------------
    // Rule Processing
    //---------------------------------------------------------------------------------------------

    protected async evaluateRules(planning: PlanningContext, event: DialogEvent): Promise<boolean> {
        let handled = false;
        switch (event.name) {
            case RuleDialogEventNames.beginDialog:
                // Emit event
                handled = await this.queueFirstMatch(planning, event);
                if (!handled) {
                    if (this.steps.length > 0) {
                        // Initialize plan with steps
                        const changes: PlanChangeList = {
                            desire: DialogConsultationDesire.shouldProcess,
                            changeType: PlanChangeType.doSteps,
                            steps: []
                        };
                        this.steps.forEach((step) => {
                            changes.steps.push({
                                dialogId: step.id,
                                dialogStack: []
                            });
                        });
                        planning.queueChanges(changes);
                        handled = true;
                    } else {
                        // Dispatch activityReceived event
                        handled = await this.evaluateRules(planning, { name: RuleDialogEventNames.activityReceived, value: undefined, bubble: false });
                    }
                }
                break;
            case RuleDialogEventNames.consultDialog:
                // Emit event
                handled = await this.queueFirstMatch(planning, event);
                if (!handled) {
                    // Dispatch activityReceived event
                    handled = await this.evaluateRules(planning, { name: RuleDialogEventNames.activityReceived, value: undefined, bubble: false });
                }
                break;
            case RuleDialogEventNames.activityReceived:
                // Emit event
                handled = await this.queueFirstMatch(planning, event);
                if (!handled) {
                    const activity = planning.context.activity;
                    if (activity.type === ActivityTypes.Message) {
                        // Recognize utterance
                        const recognized = await this.onRecognize(planning.context);
    
                        // Dispatch utteranceRecognized event
                        handled = await this.evaluateRules(planning, { name: RuleDialogEventNames.recognizedIntent, value: recognized, bubble: false });
                    } else if (activity.type === ActivityTypes.Event) {
                        // Dispatch named event that was received
                        handled = await this.evaluateRules(planning, { name: activity.name, value: activity.value, bubble: false });
                    }
                }
                break;
            case RuleDialogEventNames.recognizedIntent:
                // Emit utteranceRecognized event
                handled = await this.queueBestMatches(planning, event);
                if (!handled) {
                    // Dispatch fallback event
                    handled = await this.evaluateRules(planning, { name: RuleDialogEventNames.unknownIntent, value: event.value, bubble: false });
                }
                break;
            case RuleDialogEventNames.unknownIntent:
                if (!planning.hasPlans) {
                    // Emit fallback event
                    handled = await this.queueFirstMatch(planning, event);
                }
                break;
            default:
                // Emit event received
                handled = await this.queueFirstMatch(planning, event);
            }

        return handled;
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
        } else {
            // Call recognizer as normal
            return this.recognizer ? await this.recognizer.recognize(context) : noneIntent;
        }
    }

    private async queueFirstMatch(planning: PlanningContext, event: DialogEvent): Promise<boolean> {
        const memory = this.getMemoryForEvent(planning, event);
        for (let i = 0; i < this.rules.length; i++) {
            const changes = await this.rules[i].evaluate(planning, event, memory);
            if (changes && changes.length > 0) {
                changes[0].turnState = memory.turn;
                planning.queueChanges(changes[0]);
                return true;
            }
        }

        return false;
    }

    private async queueBestMatches(planning: PlanningContext, event: DialogEvent): Promise<boolean> {
        // Get list of proposed changes
        const allChanges: PlanChangeList[] = [];
        const memory = this.getMemoryForEvent(planning, event);
        for (let i = 0; i < this.rules.length; i++) {
            const changes = await this.rules[i].evaluate(planning, event, memory);
            if (changes) { 
                changes.forEach((change) => {
                    change.turnState = memory.turn;
                    allChanges.push(change);
                });
            } 
        }

        // Find changes with most coverage
        const appliedChanges: { index: number; change: PlanChangeList; }[] = [];
        if (allChanges.length > 0) {
            while (true) {
                // Find the change that has the most intents and entities covered.
                const index = this.findBestChange(allChanges);
                if (index >= 0) {
                    // Add change to apply list
                    const change = allChanges[index];
                    appliedChanges.push({ index: index, change: change });

                    // Remove applied changes
                    allChanges.splice(index, 1);

                    // Remove changes with overlapping intents.
                    for (let i = allChanges.length - 1; i >= 0; i--) {
                        if (this.intentsOverlap(change, allChanges[i])) {
                            allChanges.splice(i, 1);
                        }
                    }
                } else {
                    // Exit loop
                    break;
                }
            }
        }

        // Queue changes
        if (appliedChanges.length > 0) {
            const sorted = appliedChanges.sort((a, b) => a.index - b.index);
            if (sorted.length > 1) {
                // Look for the first change that starts a new plan 
                for (let i = 0; i < sorted.length; i++) {
                    const changeType = sorted[i].change.changeType;
                    if (changeType == PlanChangeType.newPlan || changeType == PlanChangeType.replacePlan) {
                        // Queue change and remove from list
                        planning.queueChanges(sorted[i].change);
                        sorted.splice(i, 1);
                        break;
                    }
                    
                }

                // Queue additional changes
                // - Additional newPlan or replacePlan steps will be changed to a `doStepsLater`
                //   changeType so that they're appended to teh new plan.
                for (let i = 0; i < sorted.length; i++) {
                    const change = sorted[i].change;
                    switch (change.changeType) {
                        case PlanChangeType.doSteps:
                        case PlanChangeType.doStepsBeforeTags:
                        case PlanChangeType.doStepsLater:
                            planning.queueChanges(change);
                            break;
                        case PlanChangeType.newPlan:
                        case PlanChangeType.replacePlan:
                            change.changeType = PlanChangeType.doStepsLater;
                            planning.queueChanges(change);
                            break;
                    }
                }
            } else {
                // Just queue the change
                planning.queueChanges(sorted[0].change);
            }
            
            return true;
        } else {
            return false;
        }
    }

    private findBestChange(changes: PlanChangeList[]): number {
        let top: PlanChangeList;
        let topIndex = -1;
        for (let i = 0; i < changes.length; i++) {
            const change = changes[i];
            let better = false;
            if (!top) {
                better = true;
            } else {
                const topIntents = top.intentsMatched || [];
                const intents = change.intentsMatched || [];
                if (intents.length > topIntents.length) {
                    better = true;
                } else if (intents.length == topIntents.length) {
                    const topEntities = top.entitiesMatched || [];
                    const entities = change.entitiesMatched || [];
                    better = entities.length > topEntities.length;
                }
            }

            if (better) {
                top = change;
                topIndex = i;
            }
        }
        return topIndex;
    }

    private intentsOverlap(c1: PlanChangeList, c2: PlanChangeList): boolean {
        const i1 = c1.intentsMatched || [];
        const i2 = c2.intentsMatched || [];
        if (i2.length > 0 && i1.length > 0) {
            for (let i = 0; i < i2.length; i++) {
                if (i1.indexOf(i2[i]) >= 0) {
                    return true;
                }
            }
        } else if (i2.length == i1.length) {
            return true;
        }
        return false;
    }

    //---------------------------------------------------------------------------------------------
    // Plan Execution
    //---------------------------------------------------------------------------------------------

    protected async consultPlan(planning: PlanningContext): Promise<DialogConsultation|undefined> {
        // Apply any queued up changes
        await planning.applyChanges();

        // Get a unique instance ID for the current stack entry.
        // - We need to do this because things like cancellation can cause us to be removed
        //   from the stack and we want to detect this so we can stop processing steps.
        const instanceId = this.getUniqueInstanceId(planning);

        // Delegate consultation to any active planning step
        const step = PlanningContext.createForStep(planning, this.dialogs);
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

    protected async continuePlan(planning: PlanningContext): Promise<DialogTurnResult> {
        // Consult plan and execute returned processor
        try {
            const consultation = await this.consultPlan(planning);
            if (consultation) {
                return await consultation.processor(planning);
            } else {
                return await this.onEndOfPlan(planning);
            }
        } catch (err) {
            return await planning.cancelAllDialogs('error', { message: err.message, stack: err.stack });
        }
    }

    protected async onEndOfPlan(planning: PlanningContext): Promise<DialogTurnResult> {
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
        if (this.autoEnd == undefined) {
            return (dc.parent != null);
        } else {
            return this.autoEnd;
        }
    }
}
