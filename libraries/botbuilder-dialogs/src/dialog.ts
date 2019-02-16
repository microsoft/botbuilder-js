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
 */
export interface DialogInstance {
    /**
     * ID of the dialog this instance is for.
     */
    id: string;

    /**
     * The instances persisted state or the index of the state object to use.
     * 
     * @remarks
     * When the dialog referenced by [id](#id) derives from `DialogCommand`, the state field will 
     * contain the stack index of the state object that should be inherited by the command.  
     */
    state: any;
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

export interface DialogEvent {
    /**
     * If `true` the event will be bubbled to the parent `DialogContext` if not handled by the 
     * current dialog.
     */
    bubble: boolean;

    /**
     * Name of the event being raised.
     */
    name: string;

    /**
     * (Optional) value associated with the event.
     */
    value?: any;
}

export interface DialogConfiguration {
    id?: string;

    tags?: string[];

    inputBindings?: { [option:string]: string; };

    outputBinding?: string;

    telemetryClient?: BotTelemetryClient;
}

export enum DialogConsultationDesire {
    /**
     * The dialog can process the utterance but if parent dialogs should process it they can. 
     */
    canProcess = 'canProcess',

    /**
     * The dialog should process the utterance.
     */
    shouldProcess = 'shouldProcess'
}

export interface DialogConsultation {
    /**
     * Expresses the desire of the dialog to process the current utterance.
     */
    desire: DialogConsultationDesire;

    /**
     * Function that should be invoked to process the utterance.
     */
    processor: (dc: DialogContext) => Promise<DialogTurnResult>;
}

/**
 * Base class for all dialogs.
 */
export abstract class Dialog<O extends object = {}> {
    private _id: string;

    /**
     * Signals the end of a turn by a dialog method or waterfall/sequence step.
     */
    public static EndOfTurn: DialogTurnResult = { status: DialogTurnStatus.waiting };

    /**
     * (Optional) set of tags assigned to the dialog.
     */
    public readonly tags: string[] = [];

    /**
     * (Optional) JSONPath expression for the memory slots to bind the dialogs options to on a 
     * call to `beginDialog()`. 
     */
    public readonly inputBindings: { [option:string]: string; } = {};

    /**
     * (Optional) JSONPath expression for the memory slot to bind the dialogs result to when 
     * `endDialog()` is called.
     */
    public outputBinding: string;

    /**
     * The telemetry client for logging events.
     * Default this to the NullTelemetryClient, which does nothing.
     */
    protected _telemetryClient: BotTelemetryClient =  new NullTelemetryClient();

    /**
     * Creates a new Dialog instance.
     * @param dialogId (Optional) unique ID to assign to the dialog.
     */
    constructor(dialogId?: string) {
        this._id = dialogId;
    }

    /**
     * Unique ID of the dialog.
     * 
     * @remarks
     * This will be automatically generated if not specified.
     */
    public get id(): string {
        if (this._id === undefined) {
            this._id = this.onComputeID();
        }
        return this._id;
    }

    public set id(value: string) {
        this._id = value;
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

    public addTags(tags: string): this {
        if (tags && tags.length > 0) {
            tags.split('.').forEach((tag) => this.tags.push(tag));
        }
        return this;
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
     * Called when an instance of the dialog is being consulted about its desire to process the 
     * current utterance.
     *
     * @remarks
     * SHOULD be overridden by dialogs that support multi-turn conversations. A function for 
     * processing the utterance is returned along with a code indicating the dialogs desire to 
     * process the utterance.  This can be one of the following values.
     * 
     * - `canProcess` - The dialog is capable of processing the utterance but parent dialogs 
     * should feel free to intercept the utterance if they'd like.
     * - `shouldProcess` - The dialog (or one of its children) wants to process the utterance 
     * so parents should not intercept it.
     * 
     * The default implementation calls the legacy [continueDialog()](#continuedialog) for 
     * compatibility reasons. That method simply calls `DialogContext.endDialog()`.
     * @param dc The dialog context for the current turn of conversation.
     */
    public async consultDialog(dc: DialogContext): Promise<DialogConsultation> {
        return {
            desire: DialogConsultationDesire.canProcess,
            processor: (dc) => this.continueDialog(dc)
        };
    }

    /**
     * Legacy dialog continuation method.
     *
     * @remarks
     * Multi-turn dialogs should now override [consultDialog()](#consultdialog) instead.
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
     * Called when an event has been raised, using `DialogContext.emitEvent()`, by either the current 
     * dialog or a dialog that the current dialog started. 
     * @param dc The dialog context for the current turn of conversation.
     * @param event The event being raised.
     * @returns `true` if the event is handled by the current dialog and bubbling should stop.
     */
    public onDialogEvent(dc: DialogContext, event: DialogEvent): Promise<boolean> {
        return Promise.resolve(false);
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

    /**
     * Called when a unique ID needs to be computed for a dialog.
     * 
     * @remarks
     * SHOULD be overridden to provide a more contextually relevant ID. The default implementation 
     * returns `dialog[${this.bindingPath()}]`. 
     */
    protected onComputeID(): string {
        return `dialog[${this.bindingPath()}]`;
    }

    protected bindingPath(): string {
        if (this.inputBindings.hasOwnProperty('value')) {
            return this.inputBindings['value'];
        } else if (this.outputBinding && this.outputBinding.length) {
            return this.outputBinding;
        } else {
            return '';
        }
    }

    public static configure(dialog: Dialog, config: DialogConfiguration): void {
        if (config.id) { dialog.id = config.id }
        if (config.telemetryClient) { dialog.telemetryClient = config.telemetryClient }
        if (config.outputBinding) { dialog.outputBinding = config.outputBinding }
        if (config.inputBindings) {
            for (const key in config.inputBindings) {
                dialog.inputBindings[key] = config.inputBindings[key];
            }
        }
        if (config.tags) { 
            config.tags.forEach((tag) => dialog.tags.push(tag));
        }
    }
}
