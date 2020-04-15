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
import { DialogEvents } from './dialogEvents';

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

    /**
     * Checks to see if a containers child dialogs have changed since the current dialog instance
     * was started.
     * 
     * @remarks
     * This should be called at the start of `beginDialog()`, `continueDialog()`, and `resumeDialog()`.
     * @param dc Current dialog context.
     */
    protected async checkForChanges(dc: DialogContext): Promise<void> {
        const current = dc.activeDialog.changeHash;
        dc.activeDialog.changeHash = this.dialogs.changeHash;

        // Check for change of previously stored hash
        if (current && current != dc.activeDialog.changeHash) {
            // Give bot an opportunit to handle the change.
            // - If bot handles it the changeHash will have been updated as to avoid triggering the 
            //   change again.
            const handled = await dc.emitEvent(DialogEvents.dialogChanged, this.id, true, false);
            if (!handled) {
                // Throw an error for bot to catch
                throw new Error(`Change detected for '${this.id}' dialog.`);
            }
        }
    }
}