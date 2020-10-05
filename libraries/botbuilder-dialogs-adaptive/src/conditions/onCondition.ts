/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogDependencies, DialogStateManager, DialogPath } from 'botbuilder-dialogs';
import { Expression, ExpressionParserInterface, Constant, ExpressionParser, ExpressionEvaluator, ReturnType, FunctionUtils } from 'adaptive-expressions';
import { ActionScope } from '../actions/actionScope';
import { BoolExpression, IntExpression } from 'adaptive-expressions';
import { AdaptiveDialog } from '../adaptiveDialog';
import { ActionContext } from '../actionContext';
import { ActionChangeList } from '../actionChangeList';
import { ActionState } from '../actionState';
import { ActionChangeType } from '../actionChangeType';

export class OnCondition implements DialogDependencies {
    /**
     * Evaluates the rule and returns a predicted set of changes that should be applied to the
     * current plan.
     * @param planning Planning context object for the current conversation.
     * @param event The current event being evaluated.
     * @param preBubble If `true`, the leading edge of the event is being evaluated.
     */

    private _actionScope: ActionScope;
    private _extraConstraints: Expression[] = [];
    private _fullConstraint: Expression;

    /**
     * Gets or sets the condition which needs to be met for the actions to be executed (OPTIONAL).
     */
    public condition: BoolExpression;

    /**
     * Gets or sets the actions to add to the plan when the rule constraints are met.
     */
    public actions: Dialog[] = [];

    /**
     * Get or sets the rule priority expression where 0 is the highest and less than 0 is ignored.
     */
    public priority: IntExpression = new IntExpression(0);

    /**
     * A value indicating whether rule should only run once per unique set of memory paths.
     */
    public runOnce: boolean;

    /**
     * Id for condition.
     */
    public id: string;

    protected get actionScope(): ActionScope {
        if (!this._actionScope) {
            this._actionScope = new ActionScope(this.actions);
        }
        return this._actionScope;
    }

    /**
     * Create a new `OnCondition` instance.
     * @param condition (Optional) The condition which needs to be met for the actions to be executed.
     * @param actions (Optional) The actions to add to the plan when the rule constraints are met.
     */
    public constructor(condition?: string, actions: Dialog[] = []) {
        this.condition = condition ? new BoolExpression(condition) : undefined;
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
                    allExpressions.push(this.condition.toExpression());
                } catch (err) {
                    throw Error(`Invalid constraint expression: ${ this.condition.toString() }, ${ err.toString() }`);
                }
            }

            if (this._extraConstraints.length > 0) {
                allExpressions.push(...this._extraConstraints);
            }

            if (allExpressions.length > 0) {
                this._fullConstraint = Expression.andExpression(...allExpressions);
            } else {
                this._fullConstraint = new Constant(true);
            }

            if (this.runOnce) {
                // TODO: Once we add support for the MostSpecificSelector the code below will need
                //       some tweaking to wrap runOnce with a call to 'ignore'.
                const runOnce = new ExpressionEvaluator(`runOnce${ this.id }`, (exp, state: DialogStateManager) => {
                    const basePath = `${ AdaptiveDialog.conditionTracker }.${ this.id }.`;
                    const lastRun: number = state.getValue(basePath + 'lastRun');
                    const paths: string[] = state.getValue(basePath + 'paths');
                    const changed = state.anyPathChanged(lastRun, paths);
                    return { value: changed, error: undefined };
                }, ReturnType.Boolean, FunctionUtils.validateUnary);

                this._fullConstraint = Expression.andExpression(
                    this._fullConstraint,
                    new Expression(runOnce.type, runOnce)
                );
            }
        }

        return this._fullConstraint;
    }

    /**
     * Compute the current value of the priority expression and return it.
     * @param actionContext Context to use for evaluation.
     * @returns Computed priority.
     */
    public currentPriority(actionContext: ActionContext): number {
        const { value: priority, error } = this.priority.tryGetValue(actionContext.state);
        if (error) {
            return -1;
        }
        return priority;
    }

    /**
     * Add external condition to the OnCondition
     * @param condition External constraint to add, it will be AND'ed to all other constraints.
     */
    public addExternalCondition(condition: string): void {
        if (condition) {
            try {
                const parser = new ExpressionParser();
                this._extraConstraints.push(parser.parse(condition));
                this._fullConstraint = undefined;
            } catch (err) {
                throw Error(`Invalid constraint expression: ${ condition }, ${ err.toString() }`);
            }
        }
    }

    /**
     * Method called to execute the condition's actions.
     * @param actionContext Context.
     * @returns A promise with plan change list.
     */
    public async execute(actionContext: ActionContext): Promise<ActionChangeList[]> {
        if (this.runOnce) {
            const count = actionContext.state.getValue(DialogPath.eventCounter);
            actionContext.state.setValue(`${ AdaptiveDialog.conditionTracker }.${ this.id }.lastRun`, count);
        }
        return [this.onCreateChangeList(actionContext)];
    }

    /**
     * Get child dialog dependencies so they can be added to the containers dialogset.
     */
    public getDependencies(): Dialog[] {
        return [this.actionScope];
    }

    protected onCreateChangeList(actionContext: ActionContext, dialogOptions?: any): ActionChangeList {
        const actionState: ActionState = {
            dialogId: this.actionScope.id,
            options: dialogOptions,
            dialogStack: []
        };

        const changeList: ActionChangeList = {
            changeType: ActionChangeType.insertActions,
            actions: [actionState]
        };

        return changeList;
    }
}
