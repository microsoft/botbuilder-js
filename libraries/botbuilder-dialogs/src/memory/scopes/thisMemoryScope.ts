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
 * ThisMemoryScope maps "this" -> dc.activeDialog.state
 */
export class ThisMemoryScope extends MemoryScope {
    constructor() {
        super(ScopePath.THIS);
    }

    public getMemory(dc: DialogContext): object {
        if (!dc.activeDialog) { throw new Error(`ThisMemoryScope.getMemory: no active dialog found.`) }
        return dc.activeDialog.state;
    }

    public setMemory(dc: DialogContext, memory: object): void {
        if (memory == undefined) {
            throw new Error(`ThisMemoryScope.setMemory: undefined memory object passed in.`);
        }

        if (!dc.activeDialog) { throw new Error(`ThisMemoryScope.setMemory: no active dialog found.`) }

        dc.activeDialog.state = memory;
    }
}