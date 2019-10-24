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

/**
 * ClassMemoryScope maps "class" -> dc.activeDialog.properties
 */
export class ClassMemoryScope extends MemoryScope {
    constructor() {
        super(ScopePath.CLASS, true);
    }

    public getMemory(dc: DialogContext): object {
        // if active dialog is a container dialog then "dialog" binds to it
        if (dc.activeDialog) {
            var dialog = dc.findDialog(dc.activeDialog.id);
            if (dialog != undefined) {
                return dialog;
            }
        }

        return undefined;
    }
}