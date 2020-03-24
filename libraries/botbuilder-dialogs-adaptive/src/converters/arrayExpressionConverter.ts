/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter } from 'botbuilder-dialogs-declarative';
import { ArrayExpression } from '../expressions';

export class ArrayExpressionConverter<T> implements Converter {
    public convert(value: T[]): ArrayExpression<T> {
        return new ArrayExpression<T>(value);
    }
}