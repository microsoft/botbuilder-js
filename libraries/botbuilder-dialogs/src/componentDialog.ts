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

const PERSISTED_DIALOG_STATE: string = 'dialogs';

/**
 * Additional options that can be passed into the `ComponentDialog.run()` method.
 */
export interface ComponentDialogRunOptions {
    /**
     * (Optional) options to pass to the component when its first started.
     */
    dialogOptions?: object;

    /**
     * (Optional) object used to persist the components state. If omitted the 
     * `StatePropertyAccessor<DialogState>` passed to the components constructor will be used. 
     */
    dialogState?: DialogState;
}

/**
 * Base class for a dialog that contains other child dialogs.
 *
 * @remarks
 * Component dialogs let you break your bot's logic up into components that can themselves be added
 * as a dialog to another `ComponentDialog` or `DialogSet`. Components can also be exported as part
 * of a node package and used within other bots.
 *
 * To define a new component derive a class from ComponentDialog and add your child dialogs within
 * the classes constructor:
 *
 * ```JavaScript
 * const { ComponentDialog, WaterfallDialog, TextPrompt, NumberPrompt } = require('botbuilder-dialogs);
 *
 * class FillProfileDialog extends ComponentDialog {
 *     constructor(dialogId) {
 *         super(dialogId);
 *
 *         // Add control flow dialogs
 *         this.addDialog(new WaterfallDialog('start', [
 *             async (step) => {
 *                 // Ask user their name
 *                 return await step.prompt('namePrompt', `What's your name?`);
 *             },
 *             async (step) => {
 *                 // Remember the users answer
 *                 step.values['name'] = step.result;
 *
 *                 // Ask user their age.
 *                 return await step.prompt('agePrompt', `Hi ${step.values['name']}. How old are you?`);
 *             },
 *             async (step) => {
 *                 // Remember the users answer
 *                 step.values['age'] = step.result;
 *
 *                 // End the component and return the completed profile.
 *                 return await step.endDialog(step.values);
 *             }
 *         ]));
 *
 *         // Add prompts
 *         this.addDialog(new TextPrompt('namePrompt'));
 *         this.addDialog(new NumberPrompt('agePrompt'))
 *     }
 * }
 * module.exports.FillProfileDialog = FillProfileDialog;
 * ```
 *
 * You can then add new instances of your component to another `DialogSet` or `ComponentDialog`:
 *
 * ```JavaScript
 * const dialogs = new DialogSet(dialogState);
 * dialogs.add(new FillProfileDialog('fillProfile'));
 * ```
 * @param O (Optional) options that can be passed into the `DialogContext.beginDialog()` method.
 */
export class ComponentDialog<O extends object = {}> extends Dialog<O> {

    /**
     * ID of the child dialog that should be started anytime the component is started.
     *
     * @remarks
     * This defaults to the ID of the first child dialog added using [addDialog()](#adddialog).
     */
    protected initialDialogId: string;
    private readonly dialogs: DialogSet = new DialogSet(null);
    private readonly mainDialogSet: DialogSet;

    /**
     * Creates a new ComponentDialog instance.
     * @param dialogId Unique ID of the component within its parents dialog set.
     * @param dialogState (Optional) state property used to persists the components dialog state when the `run()` method is called.
     */
    constructor(dialogId: string, dialogState?: StatePropertyAccessor<DialogState>) {
        super(dialogId);
        this.mainDialogSet = new DialogSet(dialogState);
        this.mainDialogSet.add(this);
    }

    public async beginDialog(outerDC: DialogContext, options?: O): Promise<DialogTurnResult> {
        // Start the inner dialog.
        const dialogState: DialogState = { dialogStack: [] };
        outerDC.activeDialog.state[PERSISTED_DIALOG_STATE] = dialogState;
        const innerDC: DialogContext = new DialogContext(this.dialogs, outerDC.context, dialogState);
        const turnResult: DialogTurnResult<any> = await this.onBeginDialog(innerDC, options);

        // Check for end of inner dialog
        if (turnResult.status !== DialogTurnStatus.waiting) {
            // Return result to calling dialog
            return await this.endComponent(outerDC, turnResult.result);
        } else {
            // Just signal end of turn
            return Dialog.EndOfTurn;
        }
    }

    public async continueDialog(outerDC: DialogContext): Promise<DialogTurnResult> {
        // Continue execution of inner dialog.
        const dialogState: any = outerDC.activeDialog.state[PERSISTED_DIALOG_STATE];
        const innerDC: DialogContext = new DialogContext(this.dialogs, outerDC.context, dialogState);
        const turnResult: DialogTurnResult<any> = await this.onContinueDialog(innerDC);

        // Check for end of inner dialog
        if (turnResult.status !== DialogTurnStatus.waiting) {
            // Return result to calling dialog
            return await this.endComponent(outerDC, turnResult.result);
        } else {
            // Just signal end of turn
            return Dialog.EndOfTurn;
        }
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
        // Forward to inner dialogs
        const dialogState: any = instance.state[PERSISTED_DIALOG_STATE];
        const innerDC: DialogContext = new DialogContext(this.dialogs, context, dialogState);
        await innerDC.repromptDialog();

        // Notify component.
        await this.onRepromptDialog(context, instance);
    }

    public async endDialog(context: TurnContext, instance: DialogInstance, reason: DialogReason): Promise<void> {
        // Forward cancel to inner dialogs
        if (reason === DialogReason.cancelCalled) {
            const dialogState: any = instance.state[PERSISTED_DIALOG_STATE];
            const innerDC: DialogContext = new DialogContext(this.dialogs, context, dialogState);
            await innerDC.cancelAllDialogs();
        }

        // Notify component
        await this.onEndDialog(context, instance, reason);
    }

    /**
     * Adds a child dialog or prompt to the components internal `DialogSet`.
     *
     * @remarks
     * The `Dialog.id` of the first child added to the component will be assigned to the [initialDialogId](#initialdialogid)
     * property.
     * @param dialog The child dialog or prompt to add.
     */
    public addDialog(dialog: Dialog): this {
        this.dialogs.add(dialog);
        if (this.initialDialogId === undefined) { this.initialDialogId = dialog.id; }

        return this;
    }

    /**
     * Finds a child dialog that was previously added to the component using
     * [addDialog()](#adddialog).
     * @param dialogId ID of the dialog or prompt to lookup.
     */
    public findDialog(dialogId: string): Dialog | undefined {
        return this.dialogs.find(dialogId);
    }

    /**
     * Called anytime an instance of the component has been started.
     *
     * @remarks
     * CAN be overridden by components that wish to perform custom startup logic. The
     * default implementation simply calls [onRunTurn()](#onrunturn).
     * @param innerDC Dialog context for the components internal `DialogSet`.
     * @param options (Optional) options that were passed to the component by its parent.
     */
    protected onBeginDialog(innerDC: DialogContext, options?: O): Promise<DialogTurnResult> {
        return this.onRunTurn(innerDC, options);
    }

    /**
     * Called anytime a multi-turn component receives additional activities.
     *
     * @remarks
     * CAN be overridden by components that wish to perform custom continuation logic. The
     * default implementation simply calls [onRunTurn()](#onrunturn).
     * @param innerDC Dialog context for the components internal `DialogSet`.
     */
    protected onContinueDialog(innerDC: DialogContext): Promise<DialogTurnResult> {
        return this.onRunTurn(innerDC);
    }

    /**
     * Called when the component is ending.
     *
     * @remarks
     * If the `reason` code is equal to `DialogReason.cancelCalled`, then any active child dialogs
     * will be cancelled before this method is called.
     * @param context Context for the current turn of conversation.
     * @param instance The components instance data within its parents dialog stack.
     * @param reason The reason the component is ending.
     */
    protected onEndDialog(context: TurnContext, instance: DialogInstance, reason: DialogReason): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Called when the component has been requested to re-prompt the user for input.
     *
     * @remarks
     * The active child dialog will have already been asked to reprompt before this method is called.
     * @param context Context for the current turn of conversation.
     * @param instance The instance of the current dialog.
     */
    protected onRepromptDialog(context: TurnContext, instance: DialogInstance): Promise<void> {
        return Promise.resolve();
    }

    /**
     * Called anytime an instance of the component has been started or has received additional 
     * activities.
     * 
     * @remarks
     * This method creates a single override for listing to both [onBeginDialog()](#onbegindialog) 
     * and [onContinueDialog()](#oncontinuedialog) calls.
     * 
     * SHOULD be overridden by components that wish to perform custom interruption logic. The
     * default implementation first calls `innerDC.continueDialog()` and if there was no active
     * dialog it will then call `innerDC.beginDialog()` with the dialog assigned to
     * [initialDialogId](#initialdialogid).
     * @param innerDC Dialog context for the components internal `DialogSet`.
     * @param options (Optional) options that were passed to the component by its parent.
     */
    protected async onRunTurn(innerDC: DialogContext, options?: O): Promise<DialogTurnResult> {
        let result = await innerDC.continueDialog();
        if (result.status === DialogTurnStatus.empty) {
            result = await innerDC.beginDialog(this.initialDialogId, options);
        }

        return result;
    }

    /**
     * Called when the components last active child dialog ends and the component is ending.
     *
     * @remarks
     * SHOULD be overridden by components that wish to perform custom logic before the component
     * ends.  The default implementation calls `outerDC.endDialog()` with the `result` returned
     * from the last active child dialog.
     * @param outerDC Dialog context for the parents `DialogSet`.
     * @param result Result returned by the last active child dialog. Can be a value of `undefined`.
     */
    protected endComponent(outerDC: DialogContext, result: any): Promise<DialogTurnResult> {
        return outerDC.endDialog(result);
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
     * Called from within the bots logic handler to route a received activity to the appropriate 
     * dialog.
     * 
     * @remarks
     * This method lets any component be run in isolation without having to be added to another 
     * `ComponentDialog` or `DialogSet`. 
     * @param context Context for the current turn of conversation with the user.
     * @param options (Optional) options that can be used to control the running of the component.
     */
    public async run(context: TurnContext, options?: ComponentDialogRunOptions): Promise<DialogTurnResult> {
        options = options || {};

        // Create a dialog context
        let dc: DialogContext;
        if (options.dialogState) {
            dc = new DialogContext(this.mainDialogSet, context, options.dialogState);
        } else {
            dc = await this.mainDialogSet.createContext(context);
        }

        // Attempt to continue execution of the components current dialog
        let result = await dc.continueDialog();

        // Start the component if it wasn't already running
        if (result.status === DialogTurnStatus.empty) {
            result = await dc.beginDialog(this.id, options);
        }
        return result;

    }

}
