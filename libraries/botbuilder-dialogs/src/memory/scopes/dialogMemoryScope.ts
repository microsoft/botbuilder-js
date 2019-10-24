/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { MemoryScope } from "./memoryScope";
import { ScopePath } from "./scopePath";
import { DialogContext } from "../../dialogContext";
import { DialogContainer } from "../../dialogContainer";

/**
 * DialogMemoryScope maps "dialog" -> dc.parent.activeDialog.state || dc.activeDialog.state
 */
export class DialogMemoryScope extends MemoryScope {
    constructor() {
        super(ScopePath.DIALOG);
    }

    public getMemory(dc: DialogContext): object {
        // if active dialog is a container dialog then "dialog" binds to it
        if (dc.activeDialog != undefined) {
            var dialog = dc.findDialog(dc.activeDialog.id);
            if (dialog instanceof DialogContainer) {
                return dc.activeDialog.state;
            }
        }

        // Otherwise we always bind to parent, or if there is no parent the active dialog
        const parent = dc.parent || dc;
        return parent.activeDialog ? parent.activeDialog.state : undefined;
    }

    public setMemory(dc: DialogContext, memory: object): void {
        if (memory == undefined) {
            throw new Error(`DialogMemoryScope.setMemory: undefined memory object passed in.`);
        }

        // if active dialog is a container dialog then "dialog" binds to it
        if (dc.activeDialog) {
            var dialog = dc.findDialog(dc.activeDialog.id);
            if (dialog instanceof DialogContainer) {
                dc.activeDialog.state = memory;
            }
        } else if (dc.parent && dc.parent.activeDialog) {
            dc.parent.activeDialog.state = memory;
        } else if (dc.activeDialog) {
            dc.activeDialog.state = memory;
        } else {
            throw new Error(`DialogMemoryScope.setMemory: Can't update memory. There is no active dialog dialog or parent dialog in the context`);
        }
    }
}