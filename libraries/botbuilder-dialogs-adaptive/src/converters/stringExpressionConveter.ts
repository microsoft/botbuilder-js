/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter } from 'botbuilder-dialogs-declarative';
import { StringExpression } from '../expressionProperties';

export class StringExpressionConverter implements Converter {
    public convert(value: string): StringExpression {
        return new StringExpression(value);
    }
}