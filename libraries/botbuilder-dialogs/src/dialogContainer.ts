/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from './dialog';
import { DialogContext } from './dialogContext';
import { DialogSet } from './dialogSet';

export abstract class DialogContainer<O extends object = {}> extends Dialog<O> {
    protected readonly dialogs: DialogSet = new DialogSet(null);

    /**
     * Creates a new `DialogContext` for the containers active child.
     *
     * @remarks
     * Returns `undefined` if the container has no active children. 
     * @param dc Dialog context for the active container instance.
     */
    public abstract createChildContext(dc: DialogContext): DialogContext | undefined;

    /**
     * Adds a child dialog or prompt to the containers internal `DialogSet`.
     * @param dialog The child dialog or prompt to add.
     */
    public addDialog(dialog: Dialog): this {
        this.dialogs.add(dialog);
        return this;
    }

    /**
     * Finds a child dialog that was previously added to the container using
     * [addDialog()](#adddialog).
     * @param dialogId ID of the dialog or prompt to lookup.
     */
    public findDialog(dialogId: string): Dialog | undefined {
        return this.dialogs.find(dialogId);
    }

}