
/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * util class
 */
export class Util {
    /**
     * trim char 
     * @param str input string 
     * @param char trim character
     */
    public static trim(str: string, char: string): string {
        if (char !== undefined) {
            return str.replace(new RegExp(''.concat('^\\', char, '+|\\', char, '+$'), 'g'), '');
        }

        return str.trim();
    }
}
