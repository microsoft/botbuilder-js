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
 * ThisMemoryScope maps "this" -> dc.activeDialog.state
 */
export class ThisMemoryScope extends MemoryScope {
    constructor() {
        super(ScopePath.THIS);
    }

    public getMemory(dc: DialogContext): object {
        return dc.activeDialog ? dc.activeDialog.state : undefined;
    }

    public setMemory(dc: DialogContext, memory: object): void {
        if (memory == undefined) {
            throw new Error(`ThisMemoryScope.setMemory: null memory object passed in.`);
        }

        if (dc.activeDialog == undefined) {
            throw new Error(`ThisMemoryScope.setMemory: Can't update memory. There is no active dialog.`);
        }

        dc.activeDialog.state = memory;
    }
}