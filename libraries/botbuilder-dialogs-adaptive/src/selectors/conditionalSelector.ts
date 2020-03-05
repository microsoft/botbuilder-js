/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Expression, ExpressionEngine } from "adaptive-expressions";
import { OnCondition } from "../conditions/onCondition";
import { TriggerSelector } from "../triggerSelector";
import { SequenceContext } from "../sequenceContext";

/**
 * Select between two rule selectors based on a condition.
 */
export class ConditionalSelector implements TriggerSelector {
    private _conditionals: OnCondition[];
    private _evaluate: boolean;
    private _condition: Expression;

    /**
     * Gets or sets expression that determines which selector to use.
     */
    public get condition(): string { return this._condition.toString() }
    public set condition(value: string) { this._condition = value ? new ExpressionEngine().parse(value) : undefined }

    /**
     * Gets or sets selector if condition is true.
     */
    public ifTrue: TriggerSelector;

    /**
     * Gets or sets selector if condition is false.
     */
    public ifFalse: TriggerSelector;

    public initialize(conditionals: OnCondition[], evaluate: boolean): void {
        this._conditionals = conditionals;
        this._evaluate = evaluate;
    }

    public select(context: SequenceContext): Promise<number[]> {
        const { value, error } = this._condition.tryEvaluate(context.state);
        let selector: TriggerSelector;
        if (value && !error) {
            selector = this.ifTrue;
            this.ifTrue.initialize(this._conditionals, this._evaluate);
        } else {
            selector = this.ifFalse;
            this.ifFalse.initialize(this._conditionals, this._evaluate);
        }
        return selector.select(context);
    }
}