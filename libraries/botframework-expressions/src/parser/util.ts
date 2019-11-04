
/**
 * @module botframework-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * util class
 */
export class Util {
    public static trim(str: string, char: string): string {
        if (char !== undefined) {
            return str.replace(new RegExp(''.concat('^\\', char, '+|\\', char, '+$'), 'g'), '');
        }

        return str.trim();
    }

    public static unescape(str: string): string {
        if (str !== undefined) {
            str = str.replace(/\\\\/g, '\\')
                    .replace(/\\n/g, '\n')
                    .replace(/\\r/g, '\r')
                    .replace(/\\t/g, '\t')
                    .replace(/\\"/g, '"')
                    .replace(/\\'/g, '\'');
        }

        return str;
    }
}
