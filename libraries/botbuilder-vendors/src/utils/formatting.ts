// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Pluralize a word based on a count.
 *
 * @param n Count.
 * @param text Word to pluralize.
 * @param plural Plural suffix.
 * @returns Pluralized word.
 */
export function plural(n: number, text: string, plural: string = 's') {
    return `${text}${n === 1 ? '' : plural}`;
}

/**
 * Pad left of a string.
 *
 * @param text Text to pad.
 * @returns Padded text.
 */
export function padLeft(text: string) {
    return text
        .split('\n')
        .map((line) => line.trim())
        .join('\n');
}
