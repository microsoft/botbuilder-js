/**
 * @module botbuilder-dialogs-adaptive-tests
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogContext, DialogTurnResult, DialogConfiguration } from 'botbuilder-dialogs';
import { StringExpression } from 'botbuilder-dialogs-adaptive';
import { ExpressionEngine, Expression } from 'adaptive-expressions';

export interface AssertConditionConfiguration extends DialogConfiguration {
    condition?: string | Expression;
    description?: string | StringExpression;
}

export class AssertCondition<O extends object = {}> extends Dialog<O> {

    public static readonly declarativeType: string = 'Microsoft.Test.AssertCondition';

    /**
     * Condition which must be true.
     */
    public condition: Expression;

    /**
     * Description of assertion.
     */
    public description: StringExpression;

    public configure(config: AssertConditionConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'condition':
                        this.condition = value instanceof Expression ? value : new ExpressionEngine().parse(value);
                        break;
                    case 'value':
                        this.description = value instanceof StringExpression ? value : new StringExpression(value);
                        break;
                    default:
                        super.configure({ [key]: value });
                        break;
                }
            }
        }

        return this;
    }

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