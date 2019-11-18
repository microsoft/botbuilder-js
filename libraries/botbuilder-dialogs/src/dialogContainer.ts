/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from './dialog';
import { DialogSet } from './dialogSet';
import { DialogContext } from './dialogContext';

export abstract class DialogContainer<O extends object = {}> extends Dialog<O> {
    /**
     * The containers dialog set.
     */
    public readonly dialogs = new DialogSet(undefined);

    /**
     * Creates an inner dialog context for the containers active child.
     * @param dc Parents dialog context.
     * @returns A new dialog context for the active child or `undefined` if there is no active child.
     */
    public abstract createChildContext(dc: DialogContext): DialogContext | undefined;

    /**
     * Finds a child dialog that was previously added to the container.
     * @param dialogId ID of the dialog to lookup.
     */
    public findDialog(dialogId: string): Dialog | undefined {
        return this.dialogs.find(dialogId);
    }
}