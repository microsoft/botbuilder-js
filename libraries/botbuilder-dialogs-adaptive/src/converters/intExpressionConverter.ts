/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter } from 'botbuilder-dialogs-declarative';
import { IntExpression } from '../expressions';

export class IntExpressionConverter implements Converter {
    public convert(value: string | number): IntExpression {
        return new IntExpression(value);
    }
}