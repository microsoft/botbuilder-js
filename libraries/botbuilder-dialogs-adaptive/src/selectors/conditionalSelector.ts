/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {
    BoolExpression,
    BoolExpressionConverter,
    Expression,
    ExpressionParser,
    ExpressionParserInterface,
} from 'adaptive-expressions';
import { Converter, ConverterFactory } from 'botbuilder-dialogs';
import { OnCondition } from '../conditions/onCondition';
import { TriggerSelector } from '../triggerSelector';
import { ActionContext } from '../actionContext';

export interface ConditionalSelectorConfiguration {
    condition?: boolean | string | Expression | BoolExpression;
    ifTrue?: TriggerSelector;
    ifFalse?: TriggerSelector;
}

/**
 * Select between two rule selectors based on a condition.
 */
export class ConditionalSelector extends TriggerSelector implements ConditionalSelectorConfiguration {
    public static $kind = 'Microsoft.ConditionalSelector';

    private _conditionals: OnCondition[];
    private _evaluate: boolean;

    /**
     * Expression that determines which selector to use.
     */
    public condition: BoolExpression;

    /**
     * Gets or sets selector if condition is true.
     */
    public ifTrue: TriggerSelector;

    /**
     * Gets or sets selector if condition is false.
     */
    public ifFalse: TriggerSelector;

    /**
     * Gets or sets the expression parser to use.
     */
    public parser: ExpressionParserInterface = new ExpressionParser();

    public getConverter(property: keyof ConditionalSelectorConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'condition':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Initialize the selector with the set of rules.
     * @param conditionals Possible rules to match.
     * @param evaluate True if rules should be evaluated on select.
     */
    public initialize(conditionals: OnCondition[], evaluate: boolean): void {
        this._conditionals = conditionals;
        this._evaluate = evaluate;
    }

    /**
     * Select the best rule to execute.
     * @param actionContext Dialog context for evaluation.
     * @returns A Promise with a number array.
     */
    public select(actionContext: ActionContext): Promise<OnCondition[]> {
        let selector: TriggerSelector;
        if (this.condition && this.condition.getValue(actionContext.state)) {
            selector = this.ifTrue;
            this.ifTrue.initialize(this._conditionals, this._evaluate);
        } else {
            selector = this.ifFalse;
            this.ifFalse.initialize(this._conditionals, this._evaluate);
        }
        return selector.select(actionContext);
    }
}
