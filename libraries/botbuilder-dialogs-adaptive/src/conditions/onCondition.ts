/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from 'botbuilder-dialogs';
import { Expression, ExpressionParserInterface, ExpressionType, Constant, ExpressionEngine } from 'botframework-expressions';
import { SequenceContext, ActionChangeList, ActionState, ActionChangeType } from '../sequenceContext';

export class OnCondition {
    /**
     * Evaluates the rule and returns a predicted set of changes that should be applied to the
     * current plan.
     * @param planning Planning context object for the current conversation.
     * @param event The current event being evaluated.
     * @param preBubble If `true`, the leading edge of the event is being evaluated.
     */
    // evaluate(planning: SequenceContext, event: DialogEvent, preBubble: boolean): Promise<ActionChangeList[] | undefined>;

    private _extraConstraints: Expression[] = [];
    private _fullConstraint: Expression;


    /**
     * Gets or sets the condition which needs to be met for the actions to be executed (OPTIONAL).
     */
    public condition: string;

    /**
     * Gets or sets the actions to add to the plan when the rule constraints are met.
     */
    public actions: Dialog[] = [];

    /**
     * Create a new `OnCondition` instance.
     * @param condition (Optional) The condition which needs to be met for the actions to be executed.
     * @param actions (Optional) The actions to add to the plan when the rule constraints are met.
     */
    constructor(condition?: string, actions: Dialog[] = []) {
        this.condition = condition;
        this.actions = actions;
    }

    /**
     * Get the expression for this condition
     * @param parser Expression parser.
     * @returns Expression which will be cached and used to evaluate this condition.
     */
    public getExpression(parser: ExpressionParserInterface): Expression {
        if (!this._fullConstraint) {
            const allExpressions: Expression[] = [];
            if (this.condition) {
                try {
                    allExpressions.push(parser.parse(this.condition));
                } catch (err) {
                    throw Error(`Invalid constraint expression: ${this.condition}, ${err.toString()}`);
                }
            }

            if (this._extraConstraints.length > 0) {
                allExpressions.push(...this._extraConstraints);
            }

            if (allExpressions.length > 1) {
                return Expression.makeExpression(ExpressionType.And, undefined, ...allExpressions);
            } else if (allExpressions.length == 1) {
                return allExpressions[0];
            } else {
                return new Constant(true);
            }
        }

        return this._fullConstraint;
    };

    /**
     * Add external condition to the OnCondition
     * @param condition External constraint to add, it will be AND'ed to all other constraints.
     */
    public addExternalCondition(condition: string) {
        if (condition) {
            try {
                const parser = new ExpressionEngine();
                this._extraConstraints.push(parser.parse(condition));
                this._fullConstraint = undefined;
            } catch (err) {
                throw Error(`Invalid constraint expression: ${condition}, ${err.toString()}`);
            }
        }
    }

    /**
     * Method called to execute the condition's actions.
     * @param planningContext Context.
     * @returns A promise with plan change list.
     */
    public async execute(planningContext: SequenceContext): Promise<ActionChangeList[]> {
        return Promise.resolve([this.onCreateChangeList(planningContext)]);
    }

    protected onCreateChangeList(planningContext: SequenceContext, dialogOptions?: any): ActionChangeList {
        const actionChangeList: ActionChangeList = {
            changeType: ActionChangeType.insertActions,
            actions: []
        };

        for (let i = 0; i < this.actions.length; i++) {
            const action = this.actions[i];
            const actionState: ActionState = {
                dialogId: action.id,
                dialogStack: []
            };

            if (dialogOptions) {
                actionState.options = dialogOptions
            }

            actionChangeList.actions.push(actionState);
        }

        return actionChangeList;
    }
}
