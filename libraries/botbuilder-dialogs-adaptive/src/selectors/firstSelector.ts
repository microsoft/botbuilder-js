/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ExpressionParser, ExpressionParserInterface } from 'adaptive-expressions';
import { Converters, Properties } from 'botbuilder-dialogs';
import { OnCondition } from '../conditions/onCondition';
import { TriggerSelector } from '../triggerSelector';
import { ActionContext } from '../actionContext';

/**
 * Select the first true rule implementation of TriggerSelector
 */
export class FirstSelector extends TriggerSelector {
    public static $kind = 'Microsoft.FirstSelector';

    private _conditionals: OnCondition[];
    private _evaluate: boolean;

    /**
     * Gets or sets the expression parser to use.
     */
    public parser: ExpressionParserInterface = new ExpressionParser();

    public get converters(): Converters<Properties<FirstSelector>> {
        return {};
    }

    public initialize(conditionals: OnCondition[], evaluate: boolean): void {
        this._conditionals = conditionals;
        this._evaluate = evaluate;
    }

    public select(actionContext: ActionContext): Promise<OnCondition[]> {
        let selection: OnCondition;
        let lowestPriority = Number.MAX_SAFE_INTEGER;
        if (this._evaluate) {
            for (let i = 0; i < this._conditionals.length; i++) {
                const conditional = this._conditionals[i];
                const expression = conditional.getExpression(this.parser);
                const { value, error } = expression.tryEvaluate(actionContext.state);
                if (value && !error) {
                    const priority = conditional.currentPriority(actionContext);
                    if (priority >= 0 && priority < lowestPriority) {
                        selection = conditional;
                        lowestPriority = priority;
                    }
                }
            }
        } else {
            for (let i = 0; i < this._conditionals.length; i++) {
                const conditional = this._conditionals[i];
                const priority = conditional.currentPriority(actionContext);
                if (priority >= 0 && priority < lowestPriority) {
                    selection = conditional;
                    lowestPriority = priority;
                }
            }
        }

        const result = [];
        if (selection) {
            result.push(selection);
        }

        return Promise.resolve(result);
    }
}
