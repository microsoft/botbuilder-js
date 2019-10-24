/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotTelemetryClient, NullTelemetryClient, TurnContext } from 'botbuilder-core';
import { DialogContext } from './dialogContext';

/**
 * Contains state information for an instance of a dialog on the stack.
 * 
 * @typeparam T Optional. The type that represents state information for the dialog.
 * 
 * @remarks
 * This contains information for a specific instance of a dialog on a dialog stack.
 * The dialog stack is associated with a specific dialog context and dialog set.
 * Information about the dialog stack as a whole is persisted to storage using a dialog state object.
 * 
 * **See also**
 * - [DialogState](xref:botbuilder-dialogs.DialogState)
 * - [DialogContext](xref:botbuilder-dialogs.DialogContext)
 * - [DialogSet](xref:botbuilder-dialogs.DialogSet)
 * - [Dialog](xref:botbuilder-dialogs.Dialog)
 */
export interface DialogInstance<T = any> {
    /**
     * ID of this dialog
     * 
     * @remarks
     * Dialog state is associated with a specific dialog set.
     * This ID is the the dialog's [id](xref:botbuilder-dialogs.Dialog.id) within that dialog set.
     * 
     * **See also**
     * - [DialogState](xref:botbuilder-dialogs.DialogState)
     * - [DialogSet](xref:botbuilder-dialogs.DialogSet)
     */
    id: string;

    /**
     * The state information for this instance of this dialog.
     */
    state: T;
}

/**
 * Indicates why a dialog method is being called.
 * 
 * @remarks
 * Use a dialog context to control the dialogs in a dialog set. The dialog context will pass a reference to itself
 * to the dialog method it calls. It also passes in the _reason_ why the specific method is being called.
 * 
 * **See also**
 * - [DialogContext](xref:botbuilder-dialogs.DialogContext)
 * - [DialogSet](xref:botbuilder-dialogs.DialogSet)
 * - [Dialog](xref:botbuilder-dialogs.Dialog)
 */
export enum DialogReason {
    /**
     * The dialog is being started from
     * [DialogContext.beginDialog](xref:botbuilder-dialogs.DialogContext.beginDialog) or
     * [DialogContext.replaceDialog](xref:botbuilder-dialogs.DialogContext.replaceDialog).
     */
    beginCalled = 'beginCalled',

    /**
     * The dialog is being continued from
     * [DialogContext.continueDialog](xref:botbuilder-dialogs.DialogContext.continueDialog).
     */
    continueCalled = 'continueCalled',

    /**
     * The dialog is being ended from
     * [DialogContext.endDialog](xref:botbuilder-dialogs.DialogContext.endDialog).
     */
    endCalled = 'endCalled',

    /**
     * The dialog is being ended from
     * [DialogContext.replaceDialog](xref:botbuilder-dialogs.DialogContext.replaceDialog).
     */
    replaceCalled = 'replaceCalled',

    /**
     * The dialog is being cancelled from
     * [DialogContext.cancelAllDialogs](xref:botbuilder-dialogs.DialogContext.cancelAllDialogs).
     */
    cancelCalled = 'cancelCalled',

    /**
     * A step in a [WaterfallDialog](xref:botbuilder-dialogs.WaterfallDialog) is being called
     * because the previous step in the waterfall dialog called
     * [WaterfallStepContext.next](xref:botbuilder-dialogs.WaterfallStepContext.next).
     */
    nextCalled = 'nextCalled'
}

/**
 * Represents the state of the dialog stack after a dialog context attempts to begin, continue,
 * or otherwise manipulate one or more dialogs.
 * 
 * **See also**
 * - [DialogContext](xref:botbuilder-dialogs.DialogContext)
 * - [Dialog](xref:botbuilder-dialogs.Dialog)
 */
export enum DialogTurnStatus {
    /**
     * The dialog stack is empty.
     * 
     * @remarks
     * Indicates that the dialog stack was initially empty when the operation was attempted.
     */
    empty = 'empty',

    /**
     * The active dialog on top of the stack is waiting for a response from the user.
     */
    waiting = 'waiting',

    /**
     * The last dialog on the stack completed successfully.
     * 
     * @remarks
     * Indicates that a result might be available and the stack is now empty.
     * 
     * **See also**
     * - [DialogTurnResult.result](xref:botbuilder-dialogs.DialogTurnResult.result)
     */
    complete = 'complete',

    /**
     * All dialogs on the stack were cancelled and the stack is empty.
     */
    cancelled = 'cancelled'
}

/**
 * Represents the result of a dialog context's attempt to begin, continue,
 * or otherwise manipulate one or more dialogs.
 *
 * @typeparam T Optional. The type that represents a result returned by the active dialog when it
 *      successfully completes.
 * 
 * @remarks
 * This can be used to determine if a dialog completed and a result is available, or if the stack
 * was initially empty and a dialog should be started.
 *
 * ```JavaScript
 * const dc = await dialogs.createContext(turnContext);
 * const result = await dc.continueDialog();
 *
 * if (result.status == DialogTurnStatus.completed) {
 *     const survey = result.result;
 *     await submitSurvey(survey);
 * } else if (result.status == DialogTurnStatus.empty) {
 *     await dc.beginDialog('surveyDialog');
 * }
 * ```
 * 
 * **See also**
 * - [DialogContext](xref:botbuilder-dialogs.DialogContext)
 * - [DialogSet](xref:botbuilder-dialogs.DialogSet)
 * - [Dialog](xref:botbuilder-dialogs.Dialog)
 */
export interface DialogTurnResult<T = any> {
    /**
     * The state of the dialog stack after a dialog context's attempt.
     */
    status: DialogTurnStatus;

    /**
     * The result, if any, returned by the last dialog on the stack.
     * 
     * @remarks
     * A result value is available only if
     * the stack is now empty,
     * the last dialog on the stack completed normally,
     * and the last dialog returned a result to the dialog context.
     */
    result?: T;
}

/**
 * Defines the core behavior for all dialogs.
 */
export abstract class Dialog<O extends object = {}> {
    /**
     * Gets a default end-of-turn result.
     * 
     * @remarks
     * This result indicates that a dialog (or a logical step within a dialog) has completed
     * processing for the current turn, is still active, and is waiting for more input.
     */
    public static EndOfTurn: DialogTurnResult = { status: DialogTurnStatus.waiting };

    /**
     * Gets the ID assigned to this dialog instance.
     * 
     * @remarks
     * This ID is relative to a [DialogSet](xref:botbuilder-dialogs.DialogSet)
     * and and must be unique within that set. Use [DialogSet.add](botbuilder-dialogs.DialogSet.add)
     * to add a dialog instance to a set.
     */
    public readonly id: string;

    /**
     * The telemetry client for logging events.
     * Default this to the NullTelemetryClient, which does nothing.
     */
    protected _telemetryClient: BotTelemetryClient =  new NullTelemetryClient();

    /**
     * Creates a new instance of the [Dialog](xref:botbuilder-dialogs.Dialog) class.
     * 
     * @param dialogId The ID to assign to the new dialog instance.
     */
    constructor(dialogId: string) {
        this.id = dialogId;
    }

    /** 
     * Gets the telemetry client for this dialog.
     */
    public get telemetryClient(): BotTelemetryClient {
        return this._telemetryClient;
    }

    /** 
     * Sets the telemetry client for this dialog.
     */
    public set telemetryClient(client: BotTelemetryClient) {
        this._telemetryClient = client ? client : new NullTelemetryClient();
    }

    /**
     * When overridden in a derived class, starts the dialog.
     *
     * @param dc The context for the current dialog turn.
     * @param options Optional. Arguments to use when the dialog starts.
     * 
     * @remarks
     * Derived dialogs must override this method.
     * 
     * The [DialogContext](xref:botbuilder-dialogs.DialogContext) calls this method when it creates
     * a new [DialogInstance](xref:botbuilder-dialogs.DialogInstance) for this dialog, pushes it
     * onto the dialog stack, and starts the dialog.
     * 
     * A dialog that represents a single-turn conversation should await
     * [DialogContext.endDialog](xref:botbuilder-dialogs.DialogContext.endDialog) before exiting this method.
     * 
     * **See also**
     * - [DialogContext.beginDialog](xref:botbuilder-dialogs.DialogContext.beginDialog)
     * - [DialogContext.replaceDialog](xref:botbuilder-dialogs.DialogContext.replaceDialog)
     */
    public abstract beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult>;

    /**
     * When overridden in a derived class, continues the dialog.
     *
     * @param dc The context for the current dialog turn.
     * 
     * @remarks
     * Derived dialogs that support multiple-turn conversations should override this method.
     * By default, this method signals that the dialog is complete and returns.
     * 
     * The [DialogContext](xref:botbuilder-dialogs.DialogContext) calls this method when it continues
     * the dialog.
     * 
     * To signal to the dialog context that this dialog has completed, await
     * [DialogContext.endDialog](xref:botbuilder-dialogs.DialogContext.endDialog) before exiting this method.
     * 
     * **See also**
     * - [DialogContext.continueDialog](xref:botbuilder-dialogs.DialogContext.continueDialog)
     */
    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        // By default just end the current dialog.
        return dc.endDialog();
    }

    /**
     * When overridden in a derived class, resumes the dialog after the dialog above it on the stack completes.
     *
     * @param dc The context for the current dialog turn.
     * @param reason The reason the dialog is resuming. This will typically be
     *      [DialogReason.endCalled](xref:botbuilder-dialogs.DialogReason.endCalled)
     * @param result Optional. The return value, if any, from the dialog that ended.
     * 
     * @remarks
     * Derived dialogs that support multiple-turn conversations should override this method.
     * By default, this method signals that the dialog is complete and returns.
     * 
     * The [DialogContext](xref:botbuilder-dialogs.DialogContext) calls this method when it resumes
     * the dialog. If the previous dialog on the stack returned a value, that value is in the `result`
     * parameter.
     * 
     * To start a _child_ dialog, use [DialogContext.beginDialog](xref:botbuilder-dialogs.DialogContext.beginDialog)
     * or [DialogContext.prompt](xref:botbuilder-dialogs.DialogContext.prompt); however, this dialog will not
     * necessarily be the one that started the child dialog.
     * To signal to the dialog context that this dialog has completed, await
     * [DialogContext.endDialog](xref:botbuilder-dialogs.DialogContext.endDialog) before exiting this method.
     * 
     * **See also**
     * - [DialogContext.endDialog](xref:botbuilder-dialogs.DialogContext.endDialog)
     */
    public async resumeDialog(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        // By default just end the current dialog and return result to parent.
        return dc.endDialog(result);
    }

    /**
     * When overridden in a derived class, reprompts the user for input.
     *
     * @param context The context object for the turn.
     * @param instance Current state information for this dialog.
     * 
     * @remarks
     * Derived dialogs that support validation and re-prompt logic should override this method.
     * By default, this method has no effect.
     * 
     * The [DialogContext](xref:botbuilder-dialogs.DialogContext) calls this method when the current
     * dialog should re-request input from the user. This method is implemented for prompt dialogs.
     * 
     * **See also**
     * - [DialogContext.repromptDialog](xref:botbuilder-dialogs.DialogContext.repromptDialog)
     * - [Prompt](xref:botbuilder-dialogs.Prompt)
     */
    public async repromptDialog(context: TurnContext, instance: DialogInstance): Promise<void> {
        // No-op by default
    }

    /**
     * When overridden in a derived class, performs clean up for the dialog before it ends.
     *
     * @param context The context object for the turn.
     * @param instance Current state information for this dialog.
     * @param reason The reason the dialog is ending.
     * 
     * @remarks
     * Derived dialogs that need to perform logging or cleanup before ending should override this method.
     * By default, this method has no effect.
     * 
     * The [DialogContext](xref:botbuilder-dialogs.DialogContext) calls this method when the current
     * dialog is ending.
     * 
     * **See also**
     * - [DialogContext.cancelAllDialogs](xref:botbuilder-dialogs.DialogContext.cancelAllDialogs)
     * - [DialogContext.endDialog](xref:botbuilder-dialogs.DialogContext.endDialog)
     * - [DialogContext.replaceDialog](xref:botbuilder-dialogs.DialogContext.replaceDialog)
     */
    public async endDialog(context: TurnContext, instance: DialogInstance, reason: DialogReason): Promise<void> {
        // No-op by default
    }
}
