/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression, ExpressionConverter, StringExpression, StringExpressionConverter } from 'adaptive-expressions';
import { Converters, Dialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';

export class AssertCondition<O extends object = {}> extends Dialog<O> {
    public static $kind = 'Microsoft.Test.AssertCondition';

    /**
     * Condition which must be true.
     */
    public condition: Expression;

    /**
     * Description of assertion.
     */
    public description: StringExpression;

    public converters: Converters<AssertCondition> = {
        condition: new ExpressionConverter(),
        description: new StringExpressionConverter()
    };

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        const { value } = this.condition.tryEvaluate(dc.state);
        if (!value) {
            let desc = this.description && this.description.getValue(dc.state);
            if (!desc) {
                desc = this.condition.toString();
            }
            throw new Error(desc);
        }
        return dc.endDialog();
    }

    protected onComputeId(): string {
        return `AssertCondition[${ this.condition.toString() }]`;
    }
}