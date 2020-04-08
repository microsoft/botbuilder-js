/**
 * @module botbuilder-dialogs-adaptive-tests
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { StringExpression } from 'botbuilder-dialogs-adaptive';
import { Expression } from 'adaptive-expressions';

export class AssertCondition<O extends object = {}> extends Dialog<O> {
    /**
     * Condition which must be true.
     */
    public condition: Expression;

    /**
     * Description of assertion.
     */
    public description: StringExpression;

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