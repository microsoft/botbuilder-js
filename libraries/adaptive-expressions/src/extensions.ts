/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Some util and extension functions
 */
export class Extensions {
    /**
     * Patch method
     * TODO: is there any better solution?
     * To judge if an object is implements MemoryInterface. Same with 'is MemoryInterface' in C#
     */
    public static isMemoryInterface(obj: any): boolean {
        if (obj === undefined) {
            return false;
        }

        if (typeof obj !== 'object') {
            return false;
        }

        return 'getValue' in obj && 'setValue' in obj && 'version' in obj
            && typeof obj.getValue === 'function' && typeof obj.setValue === 'function' && typeof obj.version === 'function';
    }
}
