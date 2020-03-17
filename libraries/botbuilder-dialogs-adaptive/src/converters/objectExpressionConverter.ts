/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter } from 'botbuilder-dialogs-declarative';
import { ObjectExpression } from '../expressionProperties';

export class ObjectExpressionConverter<T extends object = {}> implements Converter {
    public convert(value: T): ObjectExpression<T> {
        return new ObjectExpression<T>(value);
    }
}