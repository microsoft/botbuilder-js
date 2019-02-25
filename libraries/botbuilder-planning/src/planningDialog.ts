/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { 
    TurnContext, BotTelemetryClient, NullTelemetryClient, StatePropertyAccessor, ActivityTypes, 
    RecognizerResult
} from 'botbuilder-core';
import { 
    Dialog, DialogInstance, DialogReason, DialogTurnResult, DialogTurnStatus, DialogEvent,
    DialogContext, DialogState, DialogSet, StateMap, DialogConsultation, DialogConsultationDesire, DialogConfiguration
} from 'botbuilder-dialogs';
import { 
    PlanningEventNames, PlanningContext, PlanningState, PlanState, PlanChangeList, PlanChangeType 
} from './planningContext';
import { PlanningRule } from './rules';
import { Recognizer } from './recognizers';


export interface BotState extends DialogState {
    /**
     * (optional) values that are persisted for the lifetime of the conversation.
     * 
     * @remarks
     * These values are intended to be transient and may automatically expire after some timeout
     * period.
     */
    conversationState?: object;

    /**
     * (Optional) timestamp of when the dialog was last accessed.
     */
    lastAccess?: string;

    /**
     * (Optional) values that are persisted across all interactions with the current user.
     */
    userState?: object;    
}

export interface PlanningDialogRunOptions {
    /**
     * (Optional) object used to persist the bots dialog state. If omitted the 
     * `PlanningDialog.botState` property will be used. 
     */
    botState?: BotState;

    /**
     * (Optional) options to pass to the component when its first started.
     */
    dialogOptions?: object;

    /**
     * (Optional) number of milliseconds to expire the contents of `botState` after. 
     */
    expireAfter?: number;

    /**
     * (Optional) object used to persist the current users state. If omitted the 
     * `PlanningDialog.userState` property will be used. 
     */
    userState?: object;
}

export class PlanningDialog<O extends object = {}> extends Dialog<O> {
    private readonly dialogs: DialogSet = new DialogSet();
    private readonly runDialogSet: DialogSet = new DialogSet(); // Used by the run() method
    private installedDependencies = false;

    public readonly rules: PlanningRule[] = [];

    /**
     * (Optional) state property used to persists the bots current state when the `run()` method is called.
     */
    public botState: StatePropertyAccessor<BotState>;

    /**
     * (Optional) state property used to persist the users state when the `run()` method is called.
     */
    public userState: StatePropertyAccessor<object>;

    /**
     * (Optional) recognizer used to analyze any message utterances.
     */
    public recognizer: Recognizer;

    /**
     * Creates a new `PlanningDialog` instance.
     * @param dialogId (Optional) unique ID of the component within its parents dialog set.
     */
    constructor(dialogId?: string) {
        super(dialogId);
        this.runDialogSet.add(this);
    }
    
    /**
     * Set the telemetry client, and also apply it to all child dialogs.
     * Future dialogs added to the component will also inherit this client.
     */
    public set telemetryClient(client: BotTelemetryClient) {
        this._telemetryClient = client ? client : new NullTelemetryClient();
        this.dialogs.telemetryClient = client;
    }

     /**
     * Get the current telemetry client.
     */
    public get telemetryClient(): BotTelemetryClient {
        return this._telemetryClient;
    }
    /**
     * Fluent method for assigning a recognizer to the dialog.
     * @param recognizer The recognizer to assign to the dialog.
     */
    public setRecognizer(recognizer: Recognizer): this {
        this.recognizer = recognizer;
        return this;
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

    public async run(context: TurnContext, options?: PlanningDialogRunOptions): Promise<DialogTurnResult> {
        options = options || {};

        // Initialize bot state
        let botState = options.botState;
        if (botState) {
            if (!botState.dialogStack) { botState.dialogStack = [] }
            if (!botState.conversationState) { botState.conversationState = {} }
        } else if (this.botState) {
            botState = await this.botState.get(context, { dialogStack: [], conversationState: {} });
        } else {
            throw new Error(`RuleDialog.run(): method called without a 'botState'. Set the 'RuleDialog.botState' property or pass in the state to use.`);
        }

        // Initialize user state
        let userState: object;
        if (options.userState) {
            userState = options.userState;
        } else if (this.userState) {
            userState = await this.userState.get(context, {});
        } else if (!botState.userState) {
            botState.userState = {};
            userState = botState.userState;
        }

        // Check for expiration
        const now  = new Date();
        if (typeof options.expireAfter === 'number' && botState.lastAccess) {
            const lastAccess = new Date(botState.lastAccess);
            if (now.getTime() - lastAccess.getTime() >= options.expireAfter) {
                // Clear stack and conversation state
                botState.dialogStack = [];
                botState.conversationState = {};
            }
        }
        botState.lastAccess = now.toISOString();

        // Create a dialog context
        const dc = new DialogContext(this.runDialogSet, context, botState, new StateMap(botState.conversationState), new StateMap(userState));

        // Attempt to continue execution of the components current dialog
        let result = await dc.continueDialog();

        // Start the component if it wasn't already running
        if (result.status === DialogTurnStatus.empty) {
            result = await dc.beginDialog(this.id, options.dialogOptions);
        }

        return result;
    }

    protected onInstallDependencies(): void {
        // Install each rules steps
        this.rules.forEach((rule) => {
            rule.steps.forEach((step) => this.dialogs.add(step));
        });
    }

    //---------------------------------------------------------------------------------------------
    // Base Dialog Overrides
    //---------------------------------------------------------------------------------------------

    protected onComputeID(): string {
        return `planning(${this.bindingPath()})`;
    }
   
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        const state: PlanningState<O> = dc.activeDialog.state;

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
        await this.evaluateRules(planning, { name: PlanningEventNames.beginDialog, value: options, bubble: false });
        
        // Run plan
        return await this.continuePlan(planning);
    }

    public async consultDialog(dc: DialogContext): Promise<DialogConsultation> {
        // Create a new planning context
        const state: PlanningState<O> = dc.activeDialog.state;
        const planning = PlanningContext.create(dc, state);

        // First consult plan
        let consultation = await this.consultPlan(planning);
        if (!consultation || consultation.desire != DialogConsultationDesire.shouldProcess) {
            // Next evaluate rules
            const changesQueued = await this.evaluateRules(planning, { name: PlanningEventNames.consultDialog, value: undefined, bubble: false });
            if (changesQueued) {
                consultation = {
                    desire: DialogConsultationDesire.shouldProcess,
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
    }

    public async onDialogEvent(dc: DialogContext, event: DialogEvent): Promise<boolean> {
        // Create a new planning context
        const state: PlanningState<O> = dc.activeDialog.state;
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
        const state = instance.state as PlanningState<O>;
        const plan = state.plan;
        if (plan && plan.steps.length > 0) {
            // We need to mockup a DialogContext so that we can call repromptDialog() for the active step 
            const stepDC: DialogContext = new DialogContext(this.dialogs, context, plan.steps[0], new StateMap({}), new StateMap({}));
            await stepDC.repromptDialog();
        }
    }

    public async endDialog(context: TurnContext, instance: DialogInstance, reason: DialogReason): Promise<void> {
        // Forward cancellation to sequences
        if (reason === DialogReason.cancelCalled) {
            const state = instance.state as PlanningState<O>;
            if (state.plan) {
                await this.cancelPlan(context, state.plan);
                delete state.plan;
            }
            if (state.savedPlans) {
                for (let i = 0; i < state.savedPlans.length; i++) {
                    await this.cancelPlan(context, state.savedPlans[i]);
                }
                delete state.savedPlans;
            }
        }
    }
    
    private async cancelPlan(context, plan: PlanState): Promise<void> {
        for (let i = 0; i < plan.steps.length; i++) {
            // We need to mock up a dialog context so that endDialog() can be called on any active steps
            const stepDC: DialogContext = new DialogContext(this.dialogs, context, plan.steps[i], new StateMap({}), new StateMap({}));
            await stepDC.cancelAllDialogs();
        }
    }
 
    //---------------------------------------------------------------------------------------------
    // Rule Processing
    //---------------------------------------------------------------------------------------------

    protected async evaluateRules(planning: PlanningContext, event: DialogEvent): Promise<boolean> {
        let handled = false;
        switch (event.name) {
            case PlanningEventNames.beginDialog:
            case PlanningEventNames.consultDialog:
                // Emit event
                handled = await this.queueFirstMatch(planning, event);
                if (!handled) {
                    // Dispatch activityReceived event
                    handled = await this.evaluateRules(planning, { name: PlanningEventNames.activityReceived, value: undefined, bubble: false });
                }
                break;
            case PlanningEventNames.activityReceived:
                const activity = planning.context.activity;
                if (activity.type === ActivityTypes.Message) {
                    // Recognize utterance
                    const recognized = await this.onRecognize(planning.context);

                    // Dispatch utteranceRecognized event
                    handled = await this.evaluateRules(planning, { name: PlanningEventNames.utteranceRecognized, value: recognized, bubble: false });
                } else if (activity.type === ActivityTypes.Event) {
                    // Dispatch named event that was received
                    handled = await this.evaluateRules(planning, { name: activity.name, value: activity.value, bubble: false });
                }
                break;
            case PlanningEventNames.utteranceRecognized:
                // Emit utteranceRecognized event
                handled = await this.queueBestMatches(planning, event);
                if (!handled) {
                    // Dispatch fallback event
                    handled = await this.evaluateRules(planning, { name: PlanningEventNames.fallback, value: event.value, bubble: false });
                }
                break;
            case PlanningEventNames.fallback:
                if (!planning.plan || planning.plan.steps.length == 0) {
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
        const noneIntent: RecognizerResult = {
            text: context.activity.text || '',
            intents: { 'None': { score: 0.0 } },
            entities: {}
        };
        return this.recognizer ? await this.recognizer.recognize(context) : noneIntent;
    }

    private async queueFirstMatch(planning: PlanningContext, event: DialogEvent): Promise<boolean> {
        for (let i = 0; i < this.rules.length; i++) {
            const changes = await this.rules[i].evaluate(planning, event);
            if (changes && changes.length > 0) {
                planning.queueChanges(changes[0]);
                return true;
            }
        }

        return false;
    }

    private async queueBestMatches(planning: PlanningContext, event: DialogEvent): Promise<boolean> {
        // Get list of proposed changes
        const allChanges: PlanChangeList[] = [];
        for (let i = 0; i < this.rules.length; i++) {
            const changes = await this.rules[i].evaluate(planning, event);
            if (changes) { changes.forEach((change) => allChanges.push(change)) } 
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

    protected async consultPlan(planning: PlanningContext): Promise<DialogConsultation> {
        // Apply any queued up changes
        await planning.applyChanges();

        // Get a unique instance ID for the current stack entry.
        // - We need to do this because things like cancellation can cause us to be removed
        //   from the stack and we want to detect this so we can stop processing steps.
        const instanceId = this.getUniqueInstanceId(planning);

        // Delegate consultation to any active planning step
        const step = PlanningContext.createForStep(planning, this.dialogs);
        const consultation = step ? await step.consultDialog() : undefined;
        return {
            desire: consultation ? consultation.desire : DialogConsultationDesire.canProcess,
            processor: async (dc) => {
                if (step) {
                    // Continue current step
                    console.log(`running step: ${step.plan.steps[0].dialogId}`);
                    let result = consultation ? await consultation.processor(step) : { status: DialogTurnStatus.empty };
                    if (result.status == DialogTurnStatus.empty && !result.parentEnded) {
                        const nextStep = step.plan.steps[0];
                        result = await step.beginDialog(nextStep.dialogId, nextStep.options);
                    }

                    // Process step results
                    if (!result.parentEnded && this.getUniqueInstanceId(planning) === instanceId) {
                        // Is step waiting?
                        if (result.status === DialogTurnStatus.waiting) {
                            return result;
                        }

                        // End the current step
                        // - If we intercepted a cancellation, the plan should get updated with 
                        //   additional steps when we continue.
                        await planning.endStep();

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
                } else if (planning.activeDialog) {
                    return await this.onEndOfPlan(planning);
                }
            }
        }
    }

    protected async continuePlan(planning: PlanningContext): Promise<DialogTurnResult> {
        // Consult plan and execute returned processor
        const consultation = await this.consultPlan(planning);
        return await consultation.processor(planning);
    }

    protected async onEndOfPlan(planning: PlanningContext): Promise<DialogTurnResult> {
        // End dialog and return default result
        const state: PlanningState<O> = planning.activeDialog.state;
        return await planning.endDialog(state.result);
    }

    private getUniqueInstanceId(dc: DialogContext): string {
        return dc.stack.length > 0 ? `${dc.stack.length}:${dc.activeDialog.id}` : '';
    }
}
