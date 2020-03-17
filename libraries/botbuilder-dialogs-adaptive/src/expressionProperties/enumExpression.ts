/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionProperty } from './expressionProperty';

/**
 * EnumExpression - represents a property which is either an enum of T or a string expression which resolves to an enum.
 * @remarks
 * String values are always interpreted as an expression whether it has '=' prefix or not, as string values cannot be parsed to enum values.
 */
export class EnumExpression extends ExpressionProperty<any> {
    public constructor(value: any) {
        super(value);
    }

    public setValue(value: any): void {
        super.setValue(undefined); // reset value and expression
        
        if (typeof value == 'string') {
            if (value.startsWith('=')) {
                this.expressionText = value;
            } else {
                this.value = value;
            }
            return;
        }
        super.setValue(value);
    }
}