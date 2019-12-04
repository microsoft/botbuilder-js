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
 * TurnMemoryScope represents memory scoped to the current turn.
 */
export class TurnMemoryScope extends MemoryScope {
    constructor() {
        super(ScopePath.TURN);
    }

    public getMemory(dc: DialogContext): object {
        let memory = dc.context.turnState.get(TURN_STATE);
        if (typeof memory != 'object') {
            memory = {};
            dc.context.turnState.set(TURN_STATE, memory);    
        }

        return memory;
    }

    public setMemory(dc: DialogContext, memory: object): void {
        if (memory == undefined) {
            throw new Error(`TurnMemoryScope.setMemory: undefined memory object passed in.`);
        }

        dc.context.turnState.set(TURN_STATE, memory);
    }
}

/**
 * @private
 */
const TURN_STATE = Symbol('turn');