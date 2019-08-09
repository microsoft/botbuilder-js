/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { PathResolver } from './pathResolver';
import { DialogContext } from '../dialogContext';

export class DefaultPathResolver implements PathResolver {
    private readonly caseSensitive: boolean;

    constructor(caseSensitive = false) {
        this.caseSensitive = caseSensitive;
    }

    public matched(dc: DialogContext, path: string): boolean {
        return true;
    }

    public getValue(dc: DialogContext, memory: object, path: string): any {
        const segments = path.split('.');
        let value = memory;
        for (let i = 0; i < segments.length; i++) {
            if (!Array.isArray(value) && typeof value == 'object') {
                const segment = this.findSegment(value, segments[i]);
                if (segment) {
                    value = value[segment];
                    continue;
                }
            } 
            
            value = undefined;
            break;
        }

        return value;
    }

    public setValue(dc: DialogContext, memory: object, path: string, value: any): void {
        const segments = path.split('.');
        for (let i = 0; i < segments.length; i++) {
            // Find segment
            let segment = this.findSegment(memory, segments[i]);
            if (!segment) {
                segment = segments[i];
            }

            // Are we on the last segment
            if (i == segments.length - 1) {
                memory[segment] = value;
            } else {
                // Ensure segments value is an object
                const value = memory[segment];
                if (Array.isArray(value) || typeof value != 'object') {
                    memory[segment] = {};
                }

                // Next segment
                memory = memory[segment];
            }
        }

        return value;
    }

    public removeValue(dc: DialogContext, memory: object, path: string): void {
        const segments = path.split('.');
        for (let i = 0; i < segments.length; i++) {
            // Find segment
            let segment = this.findSegment(memory, segments[i]);
            if (!segment) {
                break;
            }

            // Are we on the last segment
            if (i == segments.length - 1) {
                delete memory[segment];
            } else {
                // Ensure segments value is an object
                const value = memory[segment];
                if (Array.isArray(value) || typeof value != 'object') {
                    break;
                }

                // Next segment
                memory = memory[segment];
            }
        }
    }

    private findSegment(obj: object, name: string): string {
        if (this.caseSensitive) {
            // Return name if exists
            return obj.hasOwnProperty(name) ? name : undefined;
        } else {
            // Case insensitive search for name that returns original case if found.
            const key = name.toLowerCase();
            for (const prop in obj) {
                if (key == prop.toLowerCase()) {
                    return prop;
                }
            }

            return undefined;
        }
    }
}