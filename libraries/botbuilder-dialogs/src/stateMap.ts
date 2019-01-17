/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { EventEmitter } from 'events';

export enum StateMapEvents {
    delete = 'delete',
    change = 'change'
}

export interface DeletedStateEvent {
    name: string;
    tags: string[];
}

export interface ChangedStateEvent {
    name: string;
    value: any;
    tags: string[];
}

export class StateMap extends EventEmitter {
    public readonly memory: StateMemory;

    constructor(memory: object) {
        super();
        this.memory = memory as StateMemory;
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

            // Notify listeners
            this.emit(StateMapEvents.delete, {
                name: name,
                tags: this.getTags(name)
            } as DeletedStateEvent)
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

        // Notify listeners
        this.emit(StateMapEvents.change, {
            name: name,
            value: value,
            tags: this.getTags(name)
        } as ChangedStateEvent)

        return this;
    }

    public getTags(name: string): string[] {
        const tags = this.memory["@tags"] || {};
        return tags[name] || [];
    }

    public setTags(name: string, ...tags: string[]): this {
        // Create tag set on first access
        if (!this.memory.hasOwnProperty('@tags')) { this.memory["@tags"] = {} }

        // Save tags to set
        this.memory["@tags"][name] = tags;

        return this;
    }

    public deleteTags(name: string): boolean {
        if (this.memory.hasOwnProperty('@tags')) {
            const tags = this.memory["@tags"];
            if (tags.hasOwnProperty(name)) {
                delete tags[name];
                return true;
            }
        }
        return false;
    }
}

/**
 * @private
 */
interface StateMemory {
    [name:string]: any;
    '@tags': { [name:string]: string[] }; 
}
