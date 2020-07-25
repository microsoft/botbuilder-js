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
     * @param unit A JSON value which may have some binding paths.
     * @returns Deep data binding result.
     */
    public static replaceJsonRecursively(state: DialogStateManager, unit: object): any {
        if (typeof unit === 'string') {
            const { value, error } = new ValueExpression(unit).tryGetValue(state);
            if (!error) {
                return value;
            }
            return unit;
        }

        if (Array.isArray(unit)) {
            let result = [];
            for (const child of unit) {
                result.push(JsonExtensions.replaceJsonRecursively(state, child));
            }
            return result;
        }

        if (typeof unit === 'object') {
            let result = {};
            for (let key in unit) {
                result[key] = JsonExtensions.replaceJsonRecursively(state, unit[key]);
            }
            return result;
        }

        return unit;
    }
}