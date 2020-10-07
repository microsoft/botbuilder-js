/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BoolExpression, BoolExpressionConverter, ExpressionParser, ExpressionParserInterface } from 'adaptive-expressions';
import { Converters } from 'botbuilder-dialogs';
import { OnCondition } from '../conditions/onCondition';
import { TriggerSelector } from '../triggerSelector';
import { ActionContext } from '../actionContext';

/**
 * Select between two rule selectors based on a condition.
 */
export class ConditionalSelector extends TriggerSelector {
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
    public parser: ExpressionParserInterface = new ExpressionParser()

    public get converters(): Converters<ConditionalSelector> {
        return {
            condition: new BoolExpressionConverter(),
        };
    }

    public initialize(conditionals: OnCondition[], evaluate: boolean): void {
        this._conditionals = conditionals;
        this._evaluate = evaluate;
    }

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