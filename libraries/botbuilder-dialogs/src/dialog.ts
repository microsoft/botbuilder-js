/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TurnContext } from '../../botbuilder/lib';
import { DialogContext } from './dialogContext';

export interface DialogContainer {
    readonly id: string;
    readonly parent: DialogContainer|undefined;
    add<T extends Dialog>(dialog: T): T;
    createContext(context: TurnContext, state: object): Promise<DialogContext>;
    find<T extends Dialog = Dialog>(dialogId: string): T|undefined;
}

/** 
 * Tracking information for a dialog on the stack.
 * @param T (Optional) type of state being persisted for dialog. 
 */
export interface DialogInstance<T = any> {
    /** ID of the dialog this instance is for. */
    id: string;

    /** The instances persisted state. */
    state: T;
}

/**
 * Returned by `Dialog.begin()` and `Dialog.continue()` to indicate whether the dialog is still
 * active after the turn has been processed by the dialog.  This can also be used to access the
 * result of a dialog that just completed.
 * @param T (Optional) type of result returned by the dialog when it calls `dc.end()`.
 */
export interface DialogTurnResult<T = any> {
    /** If `true` a dialog is still active on the dialog stack. */
    hasActive: boolean;

    /** If `true` the dialog that was on the stack just completed and the final [result](#result) is available. */
    hasResult: boolean;

    /** Final result returned by a dialog that just completed. Can be `undefined` even when [hasResult](#hasResult) is true. */
    result?: T;
}


/**
 * Base class for all dialogs.
 * @param R (Optional) type of result that's expected to be returned by the dialog.
 * @param O (Optional) options that can be passed into the [begin()](#begin) method.
 */
export abstract class Dialog<R = any, O = {}> {
    private _parent: DialogContainer|undefined = undefined;

    /** Signals the end of a turn by a dialog method or waterfall/sequence step.  */
    static EndOfTurn: DialogTurnResult = { hasActive: true, hasResult: false };

    constructor(public readonly id: string) { }

    public get parent(): DialogContainer|undefined {
        return this._parent;
    }

    public set parent(value: DialogContainer) {
        if (this._parent != undefined) { throw new Error(`${this.id}.parent: a parent dialog container has already been assigned.`) }
        this._parent = value;
    }

    /**
     * Method called when a new dialog has been pushed onto the stack and is being activated.
     * @param dc The dialog context for the current turn of conversation.
     * @param dialogArgs (Optional) arguments that were passed to the dialog during `begin()` call that started the instance.  
     */
    abstract dialogBegin(dc: DialogContext, dialogArgs?: any): Promise<DialogTurnResult<R>>;

    /**
     * (Optional) method called when an instance of the dialog is the active dialog and the user 
     * replies with a new activity. The dialog will generally continue to receive the users replies 
     * until it calls `DialogContext.end()`, `DialogContext.begin()`, or `DialogContext.prompt()`.
     * 
     * If this method is NOT implemented then the dialog will be automatically ended when the user
     * replies. 
     * @param dc The dialog context for the current turn of conversation.
     */
    dialogContinue?(dc: DialogContext): Promise<DialogTurnResult<R>>;

    /**
     * (Optional) method called when an instance of the dialog is being returned to from another
     * dialog that was started by the current instance using `DialogContext.begin()` or 
     * `DialogContext.prompt()`.
     * 
     * If this method is NOT implemented then the dialog will be automatically ended with a call
     * to `DialogContext.end()`. Any result passed from the called dialog will be passed to the 
     * active dialogs parent. 
     * @param dc The dialog context for the current turn of conversation.
     * @param result (Optional) value returned from the dialog that was called. The type of the value returned is dependant on the dialog that was called. 
     */
    dialogResume?(dc: DialogContext, result?: any): Promise<DialogTurnResult<R>>;

    /**
     * (Optional) method called when the dialog has been requested to re-prompt the user for input.
     * @param dc The dialog context for the current turn of conversation.
     */
    dialogReprompt?(dc: DialogContext): Promise<DialogTurnResult<R>>;

    /**
     * (Optional) method called when the dialog is being cancelled through a call to `dc.cancel()`.
     * @param dc The dialog context for the current turn of conversation.
     */
    dialogCancel?(dc: DialogContext): Promise<DialogTurnResult<R>>;
}
