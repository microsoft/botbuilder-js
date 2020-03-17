/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter } from 'botbuilder-dialogs-declarative';
import { ValueExpression } from '../expressionProperties';

export class ValueExpressionConverter implements Converter {
    public convert(value: any): ValueExpression {
        return new ValueExpression(value);
    }
}