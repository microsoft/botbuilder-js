/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export class LGExtensions {
    public static trimExpression(expression: string): string {
        let result = expression.trim();
        if (result.startsWith('$')) {
            result = result.substr(1);
        }

        result = result.trim();
        
        if (result.startsWith('{') && result.endsWith('}')) {
            result = result.substr(1, result.length - 2);
        }

        return result.trim();
    }
}