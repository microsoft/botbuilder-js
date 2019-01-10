/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { EventEmitter } from 'events';

export enum SlotMapEvents {
    delete = 'delete',
    change = 'change'
}

export interface DeletedSlotEvent {
    name: string;
    tags: string[];
}

export interface ChangedSlotEvent {
    name: string;
    value: any;
    tags: string[];
}

export class SlotMap extends EventEmitter {
    public readonly memory: SlotMemory;

    constructor(memory: object) {
        super();
        this.memory = memory as SlotMemory;
    }

    public delete(name: string): boolean {
        if (this.memory.hasOwnProperty(name)) {
            // Get list of tags
            const tags = this.memory[name] || [];

            // Delete from memory
            delete this.memory[name];

            // Notify listeners
            this.emit(SlotMapEvents.delete, {
                name: name,
                tags: tags
            } as DeletedSlotEvent)
            return true;
        }

        return false;
    }

    public get<T = any>(name: string): T|undefined {
        const entry = this.memory[name];
        if (entry) {
            return entry.value;
        }

        return undefined;
    }

    public has(name: string): boolean {
        return this.memory.hasOwnProperty(name) !== undefined;
    }

    public set(name: string, value: any): this {
        // Get existing list of tags
        let entry = this.memory[name];
        const tags = entry ? entry.tags : undefined;
        
        // Save new value to memory
        entry = { value: value };
        if (tags && tags.length > 0) { entry.tags = tags; }
        this.memory[name] = entry;

        // Notify listeners
        this.emit(SlotMapEvents.change, {
            name: name,
            value: value,
            tags: tags
        } as ChangedSlotEvent)

        return this;
    }

    public tag(name: string, ...tags: string[]): this {
        // Get current tags
        let entry = this.memory[name];
        if (!entry) { entry = { value: undefined }; }
        if (!Array.isArray(entry.tags)) { entry.tags = []; }

        // Append new tags and save to memory
        tags.forEach((tag) => {
            if (entry.tags.indexOf(tag) < 0) { entry.tags.push(tag) }
        });
        this.memory[name] = entry;

        return this;
    }
}

interface SlotMemory {
    [name:string]: SlotEntry;
}

interface SlotEntry {
    value: any;
    tags?: string[];
}
