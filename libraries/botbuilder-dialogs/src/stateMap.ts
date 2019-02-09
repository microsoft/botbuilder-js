/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export class StateMap {
    public readonly memory: object;

    constructor(memory: object) {
        this.memory = memory;
    }

    public clear(): void {
        for (const key in this.memory) {
            if (this.memory.hasOwnProperty(key)) {
                delete this.memory[key];
            }
        }
    }

    public delete(name: string): boolean {
        if (this.memory.hasOwnProperty(name)) {
            // Delete from memory
            delete this.memory[name];
            return true;
        }

        return false;
    }

    public get<T = any>(name: string): T|undefined {
        return this.memory[name];
    }

    public has(name: string): boolean {
        return this.memory.hasOwnProperty(name);
    }

    public set(name: string, value: any): this {
        // Save new value to memory
        this.memory[name] = value;

        return this;
    }
}
