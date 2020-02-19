/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionProperty } from '../expressionProperty';

export class ValueExpression extends ExpressionProperty<any> {
    public constructor(value: any) {
        super(value);
    }

    public setValue(value: any): void {
        let stringOrExpression: string = value.toString();
        this.expressionText = undefined;
        this.value = undefined;

        if (stringOrExpression != undefined && stringOrExpression != null) {
            if (stringOrExpression.startsWith('=')) {
                this.expressionText = stringOrExpression;
                return;
            } else if (stringOrExpression.startsWith('\\=')) {
                stringOrExpression = stringOrExpression.substr(1);
            }

            this.expressionText = `=\`${ stringOrExpression }\``;
            return;
        }

        super.setValue(value);
    }
}