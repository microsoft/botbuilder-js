/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotTelemetryClient, NullTelemetryClient, TurnContext } from 'botbuilder-core';
import { DialogContext } from './dialogContext';

/**
 * Tracking information persisted for an instance of a dialog on the stack.
 * @param T (Optional) type of state being persisted for the dialog.
 */
export interface DialogInstance<T = any> {
    /**
     * ID of the dialog this instance is for.
     */
     id: string;

    /**
     * The instances persisted state.
     */
     state: T;
}

/**
 * Codes indicating why a waterfall step is being called.
 */
export enum DialogReason {
    /**
     * A dialog is being started through a call to `DialogContext.beginDialog()`.
     */
    beginCalled = 'beginCalled',

    /**
     * A dialog is being continued through a call to `DialogContext.continueDialog()`.
     */
    continueCalled = 'continueCalled',

    /**
     * A dialog ended normally through a call to `DialogContext.endDialog()`.
     */
    endCalled = 'endCalled',

    /**
     * A dialog is ending because its being replaced through a call to `DialogContext.replaceDialog()`.
     */
    replaceCalled = 'replaceCalled',

    /**
     * A dialog was cancelled as part of a call to `DialogContext.cancelAllDialogs()`.
     */
    cancelCalled = 'cancelCalled',

    /**
     * A step was advanced through a call to `WaterfallStepContext.next()`.
     */
    nextCalled = 'nextCalled'
}

/**
 * Codes indicating the state of the dialog stack after a call to `DialogContext.continueDialog()`
 * or `DialogContext.beginDialog()`.
 */
export enum DialogTurnStatus {
    /**
     * Indicates that there is currently nothing on the dialog stack.
     */
    empty = 'empty',

    /**
     * Indicates that the dialog on top is waiting for a response from the user.
     */
    waiting = 'waiting',

    /**
     * Indicates that the dialog completed successfully, the result is available, and the stack is
     * empty.
     */
    complete = 'complete',

    /**
     * Indicates that the dialog was cancelled and the stack is empty.
     */
    cancelled = 'cancelled'
}

/**
 * Returned by `Dialog.continueDialog()` and `DialogContext.beginDialog()` to indicate whether a
 * dialog is still active after the turn has been processed by the dialog.
 *
 * @remarks
 * This can be used to determine if the dialog stack is empty:
 *
 * ```JavaScript
 * const result = await dialogContext.continueDialog();
 *
 * if (result.status == DialogTurnStatus.empty) {
 *     await dialogContext.beginDialog('helpDialog');
 * }
 * ```
 *
 * Or to access the result of a dialog that just completed:
 *
 * ```JavaScript
 * const result = await dialogContext.continueDialog();
 *
 * if (result.status == DialogTurnStatus.completed) {
 *     const survey = result.result;
 *     await submitSurvey(survey);
 * } else if (result.status == DialogTurnStatus.empty) {
 *     await dialogContext.beginDialog('surveyDialog');
 * }
 * ```
 * @param T (Optional) type of result returned by the active dialog when it calls `DialogContext.endDialog()`.
 */
export interface DialogTurnResult<T = any> {
    /**
     * Gets or sets the current status of the stack.
     */
    status: DialogTurnStatus;

    /**
     * Final result returned by a dialog that just completed. Can be `undefined` even when [hasResult](#hasResult) is true.
     */
    result?: T;
}

/**
 * Base class for all dialogs.
 */
export abstract class Dialog<O extends object = {}> {
    /**
     * Signals the end of a turn by a dialog method or waterfall/sequence step.
     */
    public static EndOfTurn: DialogTurnResult = { status: DialogTurnStatus.waiting };

    /**
     * Unique ID of the dialog.
     */
    public readonly id: string;

    /**
     * The telemetry client for logging events.
     * Default this to the NullTelemetryClient, which does nothing.
     */
    protected _telemetryClient: BotTelemetryClient =  new NullTelemetryClient();

    /**
     * Creates a new Dialog instance.
     * @param dialogId Unique ID of the dialog.
     */
    constructor(dialogId: string) {
        this.id = dialogId;
    }


    /** 
     * Retrieve the telemetry client for this dialog.
     */
    public get telemetryClient(): BotTelemetryClient {
        return this._telemetryClient;
    }

    /** 
     * Set the telemetry client for this dialog.
     */
    public set telemetryClient(client: BotTelemetryClient) {
        this._telemetryClient = client ? client : new NullTelemetryClient();
    }


    /**
     * Called when a new instance of the dialog has been pushed onto the stack and is being
     * activated.
     *
     * @remarks
     * MUST be overridden by derived class. Dialogs that only support single-turn conversations
     * should call `return await DialogContext.endDialog();` at the end of their implementation.
     * @param dc The dialog context for the current turn of conversation.
     * @param options (Optional) arguments that were passed to the dialog in the call to `DialogContext.beginDialog()`.
     */
    public abstract beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult>;

    /**
     * Called when an instance of the dialog is the active dialog and a new activity is received.
     *
     * @remarks
     * SHOULD be overridden by dialogs that support multi-turn conversations. The default
     * implementation calls `DialogContext.endDialog()`.
     * @param dc The dialog context for the current turn of conversation.
     */
    public async continueDialog(dc: DialogContext): Promise<DialogTurnResult> {
        // By default just end the current dialog.
        return dc.endDialog();
    }

    /**
     * Called when an instance of the dialog is being returned to from another dialog.
     *
     * @remarks
     * SHOULD be overridden by multi-turn dialogs that start other dialogs using
     * `DialogContext.beginDialog()` or `DialogContext.prompt()`. The default implementation calls
     * `DialogContext.endDialog()` with any results returned from the ending dialog.
     * @param dc The dialog context for the current turn of conversation.
     * @param reason The reason the dialog is being resumed. This will typically be a value of `DialogReason.endCalled`.
     * @param result (Optional) value returned from the dialog that was called. The type of the value returned is dependant on the dialog that was called.
     */
    public async resumeDialog(dc: DialogContext, reason: DialogReason, result?: any): Promise<DialogTurnResult> {
        // By default just end the current dialog and return result to parent.
        return dc.endDialog(result);
    }

    /**
     * Called when the dialog has been requested to re-prompt the user for input.
     *
     * @remarks
     * SHOULD be overridden by multi-turn dialogs that wish to provide custom re-prompt logic. The
     * default implementation performs no action.
     * @param context Context for the current turn of conversation.
     * @param instance The instance of the current dialog.
     */
    public async repromptDialog(context: TurnContext, instance: DialogInstance): Promise<void> {
        // No-op by default
    }

    /**
     * Called when the dialog is ending.
     *
     * @remarks
     * SHOULD be overridden by dialogs that wish to perform some logging or cleanup action anytime
     * the dialog ends.
     * @param context Context for the current turn of conversation.
     * @param instance The instance of the current dialog.
     * @param reason The reason the dialog is ending.
     */
    public async endDialog(context: TurnContext, instance: DialogInstance, reason: DialogReason): Promise<void> {
        // No-op by default
    }
}
