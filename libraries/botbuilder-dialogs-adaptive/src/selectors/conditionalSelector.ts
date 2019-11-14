/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Expression, ExpressionEngine } from "botframework-expressions";
import { OnCondition } from "../conditions/onCondition";
import { ITriggerSelector } from "../triggerSelector";
import { SequenceContext } from "../sequenceContext";

/**
 * Select between two rule selectors based on a condition.
 */
export class ConditionalSelector implements ITriggerSelector {
    private _conditionals: OnCondition[];
    private _evaluate: boolean;
    private _condition: Expression;

    /**
     * Gets or sets expression that determines which selector to use.
     */
    public get condition(): string { return this._condition.toString() }
    public set condition(value: string) { this._condition = (value != null) ? new ExpressionEngine().parse(value) : null }

    /**
     * Gets or sets selector if condition is true.
     */
    public ifTrue: ITriggerSelector;

    /**
     * Gets or sets selector if condition is false.
     */
    public ifFalse: ITriggerSelector;

    public initialize(conditionals: OnCondition[], evaluate: boolean): void {
        this._conditionals = conditionals;
        this._evaluate = evaluate;
    }

    public select(context: SequenceContext): Promise<number[]> {
        const { value, error } = this._condition.tryEvaluate(context.state);
        let selector: ITriggerSelector;
        if (value && error == null) {
            selector = this.ifTrue;
            this.ifTrue.initialize(this._conditionals, this._evaluate);
        } else {
            selector = this.ifFalse;
            this.ifFalse.initialize(this._conditionals, this._evaluate);
        }
        return selector.select(context);
    }
}