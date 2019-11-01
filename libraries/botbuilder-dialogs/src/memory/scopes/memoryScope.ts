/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogContext } from "../../dialogContext";

/**
 * Abstract base class for all memory scopes.
 */
export abstract class MemoryScope {
    constructor(name: string, includeInSnapshot = true)
    {
        this.includeInSnapshot = includeInSnapshot;
        this.name = name;
    }

    /**
     * Gets or sets name of the scope
     */
    public readonly name: string;

    /**
     * Gets a value indicating whether this memory should be included in snapshot.
     */
    public readonly includeInSnapshot: boolean;

    /**
     * Get the backing memory for this scope
     * @param dc Current dialog context.
     * @returns memory for the scope
     */
    public abstract getMemory(dc: DialogContext): object;

    /**
     * Changes the backing object for the memory scope.
     * @param dc Current dialog context
     * @param memory memory to assign
     */
    public setMemory(dc: DialogContext, memory: object): void {
        throw new Error(`MemoryScope.setMemory: The '${this.name}' memory scope is read-only.`);
    }

    /**
     * Loads a scopes backing memory at the start of a turn. 
     * @param dc Current dialog context.
     */
    public async load(dc: DialogContext): Promise<void> {
        // No initialization by default.
    }

    /**
     * Saves a scopes backing memory at the end of a turn. 
     * @param dc Current dialog context.
     */
    public async saveChanges(dc: DialogContext): Promise<void> {
        // No initialization by default.
    }

    /**
     * Deletes the backing memory for a scope.
     * @param dc Current dialog context.
     */
    public async delete(dc: DialogContext): Promise<void> {
        throw new Error(`MemoryScope.delete: The '${this.name}' memory scope can't be deleted.`);
    }
}
