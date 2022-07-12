/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActionContext } from '../actionContext';
import { Converter, ConverterFactory } from 'botbuilder-dialogs';
import { OnCondition } from '../conditions/onCondition';
import { TriggerSelector } from '../triggerSelector';
import { BoolProperty } from '../properties';

import {
    BoolExpression,
    BoolExpressionConverter,
    ExpressionParser,
    ExpressionParserInterface,
} from 'adaptive-expressions';

export interface ConditionalSelectorConfiguration {
    condition?: BoolProperty;
    ifTrue?: TriggerSelector;
    ifFalse?: TriggerSelector;
}

/**
 * Select between two rule selectors based on a condition.
 */
export class ConditionalSelector extends TriggerSelector implements ConditionalSelectorConfiguration {
    static $kind = 'Microsoft.ConditionalSelector';

    private _conditionals: OnCondition[];
    private _evaluate: boolean;

    /**
     * Expression that determines which selector to use.
     */
    condition: BoolExpression;

    /**
     * Gets or sets selector if condition is true.
     */
    ifTrue: TriggerSelector;

    /**
     * Gets or sets selector if condition is false.
     */
    ifFalse: TriggerSelector;

    /**
     * Gets or sets the expression parser to use.
     */
    parser: ExpressionParserInterface = new ExpressionParser();

    /**
     * Gets the converter for the selector configuration.
     *
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof ConditionalSelectorConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'condition':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Initialize the selector with the set of rules.
     *
     * @param conditionals Possible rules to match.
     * @param evaluate True if rules should be evaluated on select.
     */
    initialize(conditionals: OnCondition[], evaluate: boolean): void {
        this._conditionals = conditionals;
        this._evaluate = evaluate;
    }

    /**
     * Select the best rule to execute.
     *
     * @param actionContext Dialog context for evaluation.
     * @returns A Promise with a number array.
     */
    select(actionContext: ActionContext): Promise<OnCondition[]> {
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
