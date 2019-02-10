/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, BotTelemetryClient, NullTelemetryClient, StatePropertyAccessor, ActivityTypes, RecognizerResult, calculateChangeHash } from 'botbuilder-core';
import { Dialog, DialogInstance, DialogReason, DialogTurnResult, DialogTurnStatus, DialogEvent } from '../dialog';
import { DialogContext, DialogState } from '../dialogContext';
import { DialogSet } from '../dialogSet';
import { StateMap } from '../stateMap';
import { PlanningRule } from './planningRule';
import { PlanningEventNames, PlanningContext, PlanningState, PlanState, PlanChangeList } from './planningContext';
import { Recognizer } from './recognizer';

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

export interface RuleDialogRunOptions {
    /**
     * (Optional) object used to persist the bots dialog state. If omitted the 
     * `RuleDialog.botState` property will be used. 
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
     * `RuleDialog.userState` property will be used. 
     */
    userState?: object;
}

export class PlanningDialog<O extends object = {}> extends Dialog<O> {
    private readonly dialogs: DialogSet = new DialogSet();
    private readonly runDialogSet: DialogSet = new DialogSet(); // Used by the run() method

    private readonly rules: PlanningRule[];

    /**
     * (Optional) state property used to persists the bots current state when the `run()` method is called.
     */
    public botState: StatePropertyAccessor<BotState>;

    /**
     * (Optional) state property used to persist the users state when the `run()` method is called.
     */
    public userState: StatePropertyAccessor<object>;

    public recognizer: Recognizer;

    /**
     * Creates a new `RuleDialog` instance.
     * @param dialogId (Optional) unique ID of the component within its parents dialog set.
     */
    constructor(dialogId?: string) {
        super(dialogId);
        this.runDialogSet.add(this);
    }

    protected onComputeID(): string {
        return `planningDialog(${this.bindingPath()})`;
    }

    public beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        // Persist options to dialog state
        options = options || {} as O;
        dc.activeDialog.state = { options: options } as PlanningState<O>;
        
        return this.onBeginDialog(dc, options);
    }

    public continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        return this.onContinueDialog(dc);
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
            const stepDC: DialogContext = new DialogContext(this.dialogs, context, plan.steps[i], new StateMap({}), new StateMap({}));
            await stepDC.cancelAllDialogs();
        }
    }

    public addDialog(...dialogs: Dialog[]): this {
        dialogs.forEach((dialog) => this.dialogs.add(dialog));
        return this;
    }

    public addRule(...rules: PlanningRule[]): this {
        rules.forEach((rule) => {
            rule.steps.forEach((step) => this.dialogs.add(step));
            this.rules.push(rule);
        });
        return this;
    }

    public findDialog(dialogId: string): Dialog | undefined {
        return this.dialogs.find(dialogId);
    }

    protected async onBeginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        await this.onDialogEvent(dc, { bubble: false, name: PlanningEventNames.beginDialog });
        return await this.onRunTurn(dc, options);
    }

    protected async onContinueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        await this.onDialogEvent(dc, { bubble: false, name: PlanningEventNames.continueDialog });
        return await this.onRunTurn(dc);
    }

    protected async onRunTurn(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        // Check for active plan
        const state = dc.activeDialog.state as PlanningState<O>;
        if (state.plan && state.plan.steps.length > 0) {
            // Run current step
            const step = state.plan.steps[0];
            const innerDc = new DialogContext(this.dialogs, dc.context, step, dc.state.user, dc.state.conversation);
            let result = await innerDc.continueDialog();
            if (result.status === DialogTurnStatus.empty) {
                result = await innerDc.beginDialog(step.dialogId, step.dialogOptions);
            }

            // Is step waiting?
            if (result.status === DialogTurnStatus.waiting) {
                return result;
            }

            // Was step cancelled?
            if (result.status === DialogTurnStatus.cancelled) {
                // Cancel any remaining plan steps
                state.plan.steps = [];
            } else {
                // Remove current step from plan
                state.plan.steps.splice(0, 1);

                // TODO: check for endDialog command.
            }

            // Check for end of plan
            if (state.plan.steps.length == 0) {
                if (state.savedPlans && state.savedPlans.length > 0) {
                    state.plan = state.savedPlans.pop();
                    if (state.savedPlans.length == 0) { delete state.savedPlans }
                    await this.onDialogEvent(dc, { bubble: false, name: PlanningEventNames.planResumed});
                } else {
                    delete state.plan;
                    await this.onDialogEvent(dc, { bubble: false, name: PlanningEventNames.planEnded});
                }
            }

            // Continue plan execution
            if (state.plan && state.plan.steps[0] && state.plan.steps[0].dialogStack && state.plan.steps[0].dialogStack.length > 0) {
                // Tell step to re-prompt
                await this.repromptDialog(dc.context, dc.activeDialog);
                return { status: DialogTurnStatus.waiting };
            } else {
                return await this.onRunTurn(dc, options);
            }
        } else {
            // End dialog and return the default result field.
            return await dc.endDialog(state.result);
        }
    }

    public async onDialogEvent(dc: DialogContext, event: DialogEvent): Promise<boolean> {
        let handled = await this.doFirstMatch(dc, event);
        if (!handled) {
            switch (event.name) {
                case PlanningEventNames.beginDialog:
                case PlanningEventNames.continueDialog:
                    // Emit activityReceived event
                    handled = await this.onDialogEvent(dc, { bubble: false, name: PlanningEventNames.activityReceived, value: dc.context.activity });
                    break;
                case PlanningEventNames.activityReceived:
                    if (dc.context.activity.type === ActivityTypes.Message) {
                        // Recognize utterance
                        const recognized = await this.onRecognize(dc.context);

                        // Emit utteranceRecognized event
                        handled = await this.doBestMatch(dc, { bubble: false, name: PlanningEventNames.utteranceRecognized, value: recognized }); 
                    } else if (dc.context.activity.type === ActivityTypes.Event) {
                        // Emit named event that was received
                        handled = await this.doFirstMatch(dc, { bubble: false, name: dc.context.activity.name, value: dc.context.activity.value });
                    }
                    break;
            }
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

    private async doFirstMatch(dc: DialogContext, event: DialogEvent): Promise<boolean> {
        const planning = this.createPlanningContext(dc, event);
        for (let i = 0; i < this.rules.length; i++) {
            const change = await this.rules[i].evaluate(planning);
            if (change) {
                await planning.applyChanges(change);
                return true;
            } 
        }
        return false;
    }

    private async doBestMatch(dc: DialogContext, event: DialogEvent): Promise<boolean> {
        // Get list of proposed changes
        const changes: PlanChangeList[] = [];
        const planning = this.createPlanningContext(dc, event);
        for (let i = 0; i < this.rules.length; i++) {
            const change = await this.rules[i].evaluate(planning);
            if (change) { changes.push(change) } 
        }

        // Apply changes with most coverage
        if (changes.length > 0) {
            while (true) {
                // Find the change that has the most intents and entities covered.
                const index = this.findBestChange(changes);
                if (index >= 0) {
                    // Apply selected changes
                    const change = changes[index];
                    await planning.applyChanges(change);

                    // Remove applied changes
                    changes.splice(index, 1);

                    // Remove changes with overlapping intents.
                    for (let i = changes.length - 1; i >= 0; i--) {
                        if (this.intentsOverlap(change, changes[i])) {
                            changes.splice(i, 0);
                        }
                    }
                } else {
                    // Exit loop
                    break;
                }
            }
            return true;
        }

        return false;
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
                if (i1.indexOf(i2[i])) {
                    return true;
                }
            }
        } else if (i2.length == i1.length) {
            return true;
        }
        return false;
    }

    protected createPlanningContext(dc: DialogContext, event: DialogEvent): PlanningContext<O> {
        return new PlanningContext<O>(dc, {
            plans: dc.activeDialog.state as PlanningState<O>,
            eventName: event.name,
            eventValue: event.value
        });
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

    public async run(context: TurnContext, options?: RuleDialogRunOptions): Promise<DialogTurnResult> {
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

}
