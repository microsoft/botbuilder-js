/**
 * @module botbuilder-dialogs-adaptive-testing
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Dialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { Expression, StringExpression } from 'adaptive-expressions';

/**
 * Dialog action which allows you to add assertions into your dialog flow.
 */
export class AssertCondition<O extends object = {}> extends Dialog<O> {
    /**
     * Condition which must be true.
     */
    public condition: Expression;

    /**
     * Description of assertion.
     */
    public description: StringExpression;

    /**
     * Called when the dialog is started and pushed onto the dialog stack.
     * @param dc The DialogContext for the current turn of the conversation.
     * @param options Additional information to pass to the prompt being started.
     * @returns A Promise representing the asynchronous operation.
     */
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

    /**
     * @protected
     */
    protected onComputeId(): string {
        return `AssertCondition[${ this.condition.toString() }]`;
    }
}
