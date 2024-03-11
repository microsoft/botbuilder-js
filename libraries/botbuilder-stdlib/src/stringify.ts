// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/* eslint-disable @typescript-eslint/no-explicit-any */

/**
 * Encapsulates JSON.stringify function to detect and handle different types of errors (eg. Circular Structure).
 *
 * @remarks
 * Circular Structure:
 *   - It detects when the provided value has circular references and replaces them with [Circular *.{path to the value being referenced}].
 *
 * _replacer internal function:
 *   - Have similar functionality as the JSON.stringify internal toJSON function, but with the difference that only affects this stringify functionality.
 *
 * @example
 * // Circular Structure:
 *     {
 *       "item": {
 *         "name": "parent",
 *         "parent": null,
 *         "child": {
 *           "name": "child",
 *           "parent": "[Circular *.item]" // => obj.item.child.parent = obj.item
 *         }
 *       }
 *     }
 *
 * @param value — A JavaScript value, usually an object or array, to be converted.
 * @param replacer — A function that transforms the results.
 * @param space — Adds indentation, white space, and line break characters to the return-value JSON text to make it easier to read.
 * @returns {string} The converted JavaScript value to a JavaScript Object Notation (JSON) string.
 */
export function stringify(value: any, replacer?: (key: string, value: any) => any, space?: string | number): string {
    if (!value) {
        return '';
    }

    try {
        return JSON.stringify(value, stringifyReplacer(replacer), space);
    } catch (error: any) {
        if (!error?.message.includes('circular structure')) {
            throw error;
        }

        const seen = new WeakMap();
        return JSON.stringify(
            value,
            function stringifyCircularReplacer(key, val) {
                if (val === null || val === undefined || typeof val !== 'object') {
                    return val;
                }

                if (key) {
                    const path = seen.get(val);
                    if (path) {
                        return `[Circular *.${path.join('.')}]`;
                    }

                    const parent = seen.get(this) ?? [];
                    seen.set(val, [...parent, key]);
                }

                const value = stringifyReplacer(replacer)(key, val);
                return value;
            },
            space
        );
    }
}

function stringifyReplacer(replacer?: (key: string, value: any) => any) {
    return function stringifyReplacerInternal(this: any, key: string, val: any) {
        const replacerValue = replacer ? replacer.call(this, key, val) : val;
        if (replacerValue === null || replacerValue === undefined || typeof replacerValue !== 'object') {
            return replacerValue;
        }

        const result = replacerValue._replacer ? replacerValue._replacer(key) : replacerValue;
        return result;
    };
}
