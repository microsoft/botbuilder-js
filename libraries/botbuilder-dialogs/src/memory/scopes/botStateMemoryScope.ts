/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BotState } from 'botbuilder-core';
import { MemoryScope } from './memoryScope';
import { DialogContext } from '../../dialogContext';

/**
 * Base class for memory scopes based on BotState.
 */
export class BotStateMemoryScope extends MemoryScope {
    protected stateKey: string;

    /**
     * Initializes a new instance of the `BotStateMemoryScope` class.
     * @param name name of the property.
     */
    public constructor(name: string) {
        super(name, true);
    }

    /**
     * Get the backing memory for this scope.
     * @param dc current dialog context
     */
    public getMemory(dc: DialogContext): object {
        const botState: BotState = dc.context.turnState.get(this.stateKey);
        if (botState) {
            return botState.get(dc.context);
        }

        return undefined;
    }

    /**
     * Changes the backing object for the memory scope.
     * @param dc current dialog context
     * @param memory memory
     */
    public setMemory(dc: DialogContext, memory: object): void {
        const botState = dc.context.turnState.get(this.stateKey);
        if (!botState) {
            throw new Error(`${ this.stateKey } is not available.`);
        }
        throw new Error(`You cannot replace the root BotState object.`);
    }

    public async load(dc: DialogContext, force = false): Promise<void> {
        const botState: BotState = dc.context.turnState.get(this.stateKey);
        if (botState) {
            await botState.load(dc.context, force);
        }
    }

    public async saveChanges(dc: DialogContext, force = false): Promise<void> {
        const botState: BotState = dc.context.turnState.get(this.stateKey);
        if (botState) {
            await botState.saveChanges(dc.context, force);
        }
    }

    public async delete(dc: DialogContext): Promise<void> {
        return Promise.resolve();
    }
}
