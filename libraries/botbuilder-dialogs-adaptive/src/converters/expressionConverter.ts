/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression, ExpressionEngine } from 'adaptive-expressions';
import { Converter } from 'botbuilder-dialogs-declarative';

export class ExpressionConverter implements Converter {
    public convert(value: string): Expression {
        return new ExpressionEngine().parse(value);
    }
}