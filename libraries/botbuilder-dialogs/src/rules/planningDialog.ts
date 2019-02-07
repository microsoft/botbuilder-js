/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, BotTelemetryClient, NullTelemetryClient, StatePropertyAccessor, UserState, MemoryStorage, ConversationState } from 'botbuilder-core';
import { Dialog, DialogInstance, DialogReason, DialogTurnResult, DialogTurnStatus } from '../dialog';
import { DialogContext, DialogState } from '../dialogContext';
import { DialogSet } from '../dialogSet';
import { StateMap } from '../stateMap';

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

    /**
     * (Optional) state property used to persists the bots current state when the `run()` method is called.
     */
    public botState: StatePropertyAccessor<BotState>;

    /**
     * (Optional) state property used to persist the users state when the `run()` method is called.
     */
    public userState: StatePropertyAccessor<object>;

    /**
     * Creates a new `RuleDialog` instance.
     * @param dialogId (Optional) unique ID of the component within its parents dialog set.
     */
    constructor(dialogId?: string) {
        super(dialogId);
        this.runDialogSet.add(this);
    }

    protected onComputeID(): string {
        return `ruleDialog(${this.bindingPath()})`;
    }

    public beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
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
        const state: RuleDialogState = instance.state;
        const sequence = state.sequence;
        if (sequence && sequence.steps.length > 0) {
            const stepDC: DialogContext = new DialogContext(this.dialogs, context, sequence.steps[0], new StateMap({}), new StateMap({}));
            await stepDC.repromptDialog();
        }
    }

    public async endDialog(context: TurnContext, instance: DialogInstance, reason: DialogReason): Promise<void> {
        // Forward cancellation to sequences
        if (reason === DialogReason.cancelCalled) {
            const state: RuleDialogState = instance.state;
            if (state.sequence) {
                await this.cancelSequence(context, state.sequence);
                delete state.sequence;
            }
            if (state.savedSequences) {
                for (let i = 0; i < state.savedSequences.length; i++) {
                    await this.cancelSequence(context, state.savedSequences[i]);
                }
                delete state.savedSequences;
            }
        }
    }

    private async cancelSequence(context, sequence: SequenceState): Promise<void> {
        for (let i = 0; i < sequence.steps.length; i++) {
            const stepDC: DialogContext = new DialogContext(this.dialogs, context, sequence.steps[i], new StateMap({}), new StateMap({}));
            await stepDC.cancelAllDialogs();
        }
    }

    public addDialog(dialog: Dialog): this {
        this.dialogs.add(dialog);
        return this;
    }

    public addRule(...rules: SequenceRule[]): this {
        return this;
    }

    public findDialog(dialogId: string): Dialog | undefined {
        return this.dialogs.find(dialogId);
    }

    protected onBeginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        return this.onRunTurn(dc, options);
    }

    protected onContinueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        return this.onRunTurn(dc);
    }

    protected async onRunTurn(dc: DialogContext, options?: O): Promise<DialogTurnResult> {

        return result;
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
