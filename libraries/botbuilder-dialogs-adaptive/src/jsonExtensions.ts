/**
 * @module botbuilder-dialogs-adaptive
 */

import { DialogContext } from 'botbuilder-dialogs';
import { ExpressionParser, ValueExpression } from 'adaptive-expressions';
import { TextTemplate } from './templates';

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export class JsonExtensions {
    /**
     * Achieve deep data binding with recursion.
     * @param dc Dialog context.
     * @param unit Input object.
     * @returns Deep data binding result.
     */
    public static replaceJsonRecursively(dc: DialogContext, unit: object): any {
        if (typeof unit === 'string') {
            let text: string = unit as string;
            if (text.startsWith('{') && text.endsWith('}')) {
                text = text.slice(1, text.length - 1);
                const { value } = new ExpressionParser().parse(text).tryEvaluate(dc.state);
                return value;
            }
            else {
                return new ValueExpression(text).getValue(dc.state);
            }
        }

        if (Array.isArray(unit)) {
            let result = [];
            for (const child of unit) {
                result.push(JsonExtensions.replaceJsonRecursively(dc, child));
            }

            return result;
        }

        if (typeof unit === 'object') {
            let result = {};
            for (let key in unit) {
                result[key] = JsonExtensions.replaceJsonRecursively(dc, unit[key]);
            }
            return result;
        }

        return unit;
    }
}