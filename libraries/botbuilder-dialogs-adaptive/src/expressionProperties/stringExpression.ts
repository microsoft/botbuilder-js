/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ExpressionProperty } from '../expressionProperty';

export class StringExpression extends ExpressionProperty<string> {
    public constructor(value: string) {
        super(value);
    }

    public setValue(value: string): void {
        let stringOrExpression = value;
        if (stringOrExpression.startsWith('=')) {
            this.expressionText = stringOrExpression;
            return;
        } else if (stringOrExpression.startsWith('\\=')) {
            stringOrExpression = stringOrExpression.substr(1);
        }

        this.expressionText = `=\`${ stringOrExpression }\``;
        return;
    }
}