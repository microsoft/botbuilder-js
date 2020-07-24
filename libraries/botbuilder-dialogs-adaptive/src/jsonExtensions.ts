/**
 * @module botbuilder-dialogs-adaptive
 */

import { DialogStateManager } from 'botbuilder-dialogs';
import { ExpressionParser, ValueExpression } from 'adaptive-expressions';

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export class JsonExtensions {
    /**
     * Replaces the binding paths in a JSON value with the evaluated results recursively. Returns the final JSON value.
     * @param dc A scope for looking up variables.
     * @param token A JSON value which may have some binding paths.
     * @returns Deep data binding result.
     */
    public static replaceJsonRecursively(state: DialogStateManager, token: object): any {
        if (typeof token === 'string') {
            let text: string = token as string;
            if (text.startsWith('{') && text.endsWith('}')) {
                text = text.slice(1, text.length - 1);
                const { value } = new ExpressionParser().parse(text).tryEvaluate(state);
                return value;
            }
            else {
                return new ValueExpression(text).getValue(state);
            }
        }

        if (Array.isArray(token)) {
            let result = [];
            for (const child of token) {
                result.push(JsonExtensions.replaceJsonRecursively(state, child));
            }

            return result;
        }

        if (typeof token === 'object') {
            let result = {};
            for (let key in token) {
                result[key] = JsonExtensions.replaceJsonRecursively(state, token[key]);
            }
            return result;
        }

        return token;
    }
}