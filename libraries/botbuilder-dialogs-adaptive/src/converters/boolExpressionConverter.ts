/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Converter } from 'botbuilder-dialogs-declarative';
import { BoolExpression } from '../expressions';

export class BoolExpressionConverter implements Converter {
    public convert(value: any): BoolExpression {
        return new BoolExpression(value);
    }
}