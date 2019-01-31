/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext, BotTelemetryClient, NullTelemetryClient, StatePropertyAccessor } from 'botbuilder-core';
import { Dialog, DialogInstance, DialogReason, DialogTurnResult, DialogTurnStatus } from './dialog';
import { DialogContext, DialogState } from './dialogContext';
import { DialogSet } from './dialogSet';
import { StateMap } from './stateMap';

export interface IntentDialogState {
    sequence?: SequenceState;
    savedSequences?: SequenceState[]; 
}

export interface SequenceState {
    title?: string;
    steps: SequenceStepState[];
}

export interface SequenceStepState extends DialogState {
    dialogId: string;
    dialogOptions?: object;
}

export interface IntentDialogRunOptions {
    /**
     * (Optional) options to pass to the component when its first started.
     */
    dialogOptions?: object;

    /**
     * (Optional) object used to persist the bots conversation state. If omitted the 
     * `conversationState` accessor passed to the managers constructor will be used. 
     */
    conversationState?: IntentDialogState;

    /**
     * (Optional) object used to persist the current users state. If omitted the 
     * `userState` accessor passed to the managers constructor will be used. 
     */
    userState?: object;
}

export class InterruptionDialog<O extends object = {}> extends Dialog<O> {

    private readonly dialogs: DialogSet = new DialogSet(null);
    private readonly mainDialogSet: DialogSet;
    private readonly userState: StatePropertyAccessor<object>;

    /**
     * Creates a new IntentDialog instance.
     * @param dialogId Unique ID of the component within its parents dialog set.
     * @param dialogState (Optional) state property used to persists the components conversation state when the `run()` method is called.
     * @param userState (Optional) state property used to persist the users state when the `run()` method is called.
     */
    constructor(dialogId: string, dialogState?: StatePropertyAccessor<DialogState>, userState?: StatePropertyAccessor<object>) {
        super(dialogId);
        this.mainDialogSet = new DialogSet(dialogState);
        this.mainDialogSet.add(this);
        this.userState = userState;
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
        const state: IntentDialogState = instance.state;
        const sequence = state.sequence;
        if (sequence && sequence.steps.length > 0) {
            const stepDC: DialogContext = new DialogContext(this.dialogs, context, sequence.steps[0], new StateMap({}), new StateMap({}));
            await stepDC.repromptDialog();
        }
    }

    public async endDialog(context: TurnContext, instance: DialogInstance, reason: DialogReason): Promise<void> {
        // Forward cancellation to sequences
        if (reason === DialogReason.cancelCalled) {
            const state: IntentDialogState = instance.state;
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

    public findDialog(dialogId: string): Dialog | undefined {
        return this.dialogs.find(dialogId);
    }

    protected onBeginDialog(innerDC: DialogContext, options?: O): Promise<DialogTurnResult> {
        return this.onRunTurn(innerDC, options);
    }

    protected onContinueDialog(innerDC: DialogContext): Promise<DialogTurnResult> {
        return this.onRunTurn(innerDC);
    }

    protected async onRunTurn(innerDC: DialogContext, options?: O): Promise<DialogTurnResult> {

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

    public async run(context: TurnContext, options?: IntentDialogRunOptions): Promise<DialogTurnResult> {
        options = options || {};

        // Lookup user state
        let conversationState = options.conversationState;
        let userState = options.userState;
        if (!userState && this.userState) {
            userState = await this.userState.get(context, {});
        }

        // Create a dialog context
        let dc: DialogContext;
        if (options.conversationState) {
            const session = conversationState ? new StateMap(conversationState) : undefined;
            const user = userState ? new StateMap(userState) : undefined;
            dc = new DialogContext(this.mainDialogSet, context, options.conversationState, session, user);
        } else {
            dc = await this.mainDialogSet.createContext(context, conversationState, userState);
        }

        // Attempt to continue execution of the components current dialog
        let result = await dc.continueDialog();

        // Start the component if it wasn't already running
        if (result.status === DialogTurnStatus.empty) {
            result = await dc.beginDialog(this.id, options.dialogOptions);
        }

        return result;
    }

}
