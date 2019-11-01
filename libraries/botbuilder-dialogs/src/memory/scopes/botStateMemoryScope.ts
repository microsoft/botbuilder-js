/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { MemoryScope } from "./memoryScope";
import { DialogContext } from "../../dialogContext";
import { BotState } from 'botbuilder-core';

/**
 * Base class for memory scopes based on BotState.
 */
export class BotStateMemoryScope extends MemoryScope {
    private readonly _state: BotState;
    private readonly _propertyName: string;

    constructor(name: string, botState: BotState, propertyName?: string) {
        super(name, true);

        // Create property accessor
        this._state = botState;
        this._propertyName = propertyName || name;
    }

    public getMemory(dc: DialogContext): object {
        const state = this._state.get(dc.context);
        if (state == undefined) { throw new Error(`BotStateMemory.getMemory: load() should be called before retrieving memory.`) }
        return state[this._propertyName];
    }

    public setMemory(dc: DialogContext, memory: object): void {
        this._state.get(dc.context)[this._propertyName] = memory;
    }

    public async load(dc: DialogContext): Promise<void> {
        await this._state.load(dc.context);
    }

    public async saveChanges(dc: DialogContext): Promise<void> {
        await this._state.saveChanges(dc.context);
    }

    public async delete(dc: DialogContext): Promise<void> {
        await this._state.delete(dc.context);
    }
}