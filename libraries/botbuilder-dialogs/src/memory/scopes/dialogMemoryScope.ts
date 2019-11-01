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
        // If active dialog is a container dialog then "dialog" binds to it.
        // Otherwise the "dialog" will bind to the dialogs parent assuming it 
        // is a container.
        let parent: DialogContext = dc;
        if (!this.isContainer(parent) && this.isContainer(parent.parent)) {
            parent = parent.parent;
        }

        // If there's no active dialog then throw an error.
        if (!parent.activeDialog) { throw new Error(`DialogMemoryScope.getMemory: no active dialog found.`) }

        return parent.activeDialog.state;
    }

    public setMemory(dc: DialogContext, memory: object): void {
        if (memory == undefined) {
            throw new Error(`DialogMemoryScope.setMemory: undefined memory object passed in.`);
        }

        // If active dialog is a container dialog then "dialog" binds to it.
        // Otherwise the "dialog" will bind to the dialogs parent assuming it 
        // is a container.
        let parent: DialogContext = dc;
        if (!this.isContainer(parent) && this.isContainer(parent.parent)) {
            parent = parent.parent;
        }

        // If there's no active dialog then throw an error.
        if (!parent.activeDialog) { throw new Error(`DialogMemoryScope.setMemory: no active dialog found.`) }

        parent.activeDialog.state = memory;
    }

    private isContainer(dc: DialogContext): boolean {
        if (dc != undefined && dc.activeDialog != undefined) {
            var dialog = dc.findDialog(dc.activeDialog.id);
            if (dialog instanceof DialogContainer) {
                return true;
            }
        }

        return false;
    }
}