/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { MemoryInterface } from './memory/memoryInterface';

/**
 * Some util and extension functions
 */
export class Extensions {
    /**
     * Patch method
     * TODO: is there any better solution?
     * To judge if an object is implements MemoryInterface. Same with 'is MemoryInterface' in C#
     *
     * @param obj The object to evaluate.
     * @returns True if the object implements MemoryInterface; False if it isn't.
     */
    static isMemoryInterface(obj: any): boolean {
        if (obj === undefined) {
            return false;
        }

        if (typeof obj !== 'object') {
            return false;
        }

        return (
            'getValue' in obj &&
            'setValue' in obj &&
            'version' in obj &&
            typeof obj.getValue === 'function' &&
            typeof obj.setValue === 'function' &&
            typeof obj.version === 'function'
        );
    }

    /**
     * Generator random seed and value from properties.
     * If value is not null, the mock random value result would be: min + (value % (max - min)).
     *
     * @param memory memory state.
     * @param min The inclusive lower bound of the random number returned.
     * @param max The exclusive upper bound of the random number returned. max must be greater than or equal to min.
     * @returns Random value.
     */
    static randomNext(memory: MemoryInterface, min: number, max: number): number {
        const randomValue = memory.getValue('Conversation.TestOptions.randomValue');
        if (randomValue !== undefined) {
            return min + (randomValue % (max - min));
        }

        return Math.floor(min + Math.random() * (max - min));
    }
}
