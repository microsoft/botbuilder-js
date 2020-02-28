/**
 * @module botbuilder-dialogs-adaptive-tests
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogContext, DialogTurnResult, DialogConfiguration } from 'botbuilder-dialogs';
import { ExpressionEngine } from 'adaptive-expressions';

export interface AssertConditionConfiguration extends DialogConfiguration {
    condition?: string;
    description?: string;
}

export class AssertCondition<O extends object = {}> extends Dialog<O> {

    public static readonly declarativeType: string = 'Microsoft.Test.AssertCondition';

    /**
     * Condition which must be true.
     */
    public condition: string;

    /**
     * Description of assertion.
     */
    public description: string;

    public configure(config: AssertConditionConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        const parser = new ExpressionEngine()
        const { value, error } = parser.parse(this.condition).tryEvaluate(dc.state);
        if (!value || error) {
            throw new Error(this.description);
        }
        return dc.endDialog();
    }

    protected onComputeId(): string {
        return `AssertCondition[${ this.condition }]`;
    }
}