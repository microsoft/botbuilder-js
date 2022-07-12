/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ActionChangeList } from '../actionChangeList';
import { ActionChangeType } from '../actionChangeType';
import { ActionContext } from '../actionContext';
import { ActionScope } from '../actions/actionScope';
import { ActionState } from '../actionState';
import { AdaptiveDialog } from '../adaptiveDialog';
import { BoolProperty, NumberProperty } from '../properties';
import { DialogListConverter } from '../converters';

import {
    BoolExpression,
    BoolExpressionConverter,
    Constant,
    Expression,
    ExpressionParser,
    ExpressionEvaluator,
    FunctionUtils,
    ReturnType,
    ExpressionType,
    NumberExpression,
    NumberExpressionConverter,
} from 'adaptive-expressions';

import {
    Configurable,
    Converter,
    ConverterFactory,
    Dialog,
    DialogDependencies,
    DialogPath,
    DialogStateManager,
} from 'botbuilder-dialogs';

export interface OnConditionConfiguration {
    condition?: BoolProperty;
    actions?: string[] | Dialog[];
    priority?: NumberProperty;
    runOnce?: boolean;
    id?: string;
}

/**
 * Actions triggered when condition is true.
 */
export class OnCondition extends Configurable implements DialogDependencies, OnConditionConfiguration {
    static $kind = 'Microsoft.OnCondition';

    /**
     * Evaluates the rule and returns a predicted set of changes that should be applied to the
     * current plan.
     *
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
    condition: BoolExpression;

    /**
     * Gets or sets the actions to add to the plan when the rule constraints are met.
     */
    actions: Dialog[] = [];

    /**
     * Get or sets the rule priority expression where 0 is the highest and less than 0 is ignored.
     */
    priority: NumberExpression = new NumberExpression(0.0);

    /**
     * A value indicating whether rule should only run once per unique set of memory paths.
     */
    runOnce: boolean;

    /**
     * Id for condition.
     */
    id: string;

    /**
     * @protected
     * Gets the action scope.
     *
     * @returns The scope obtained from the action.
     */
    protected get actionScope(): ActionScope {
        if (!this._actionScope) {
            this._actionScope = new ActionScope(this.actions);
        }
        return this._actionScope;
    }

    /**
     * Create a new `OnCondition` instance.
     *
     * @param condition (Optional) The condition which needs to be met for the actions to be executed.
     * @param actions (Optional) The actions to add to the plan when the rule constraints are met.
     */
    constructor(condition?: string, actions: Dialog[] = []) {
        super();
        this.condition = condition ? new BoolExpression(condition) : undefined;
        this.actions = actions;
    }

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof OnConditionConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'condition':
                return new BoolExpressionConverter();
            case 'actions':
                return DialogListConverter;
            case 'priority':
                return new NumberExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Get the cached expression for this condition.
     *
     * @returns Cached expression used to evaluate this condition.
     */
    getExpression(): Expression {
        if (!this._fullConstraint) {
            this._fullConstraint = this.createExpression();
        }

        return this._fullConstraint;
    }

    /**
     * Compute the current value of the priority expression and return it.
     *
     * @param actionContext Context to use for evaluation.
     * @returns Computed priority.
     */
    currentPriority(actionContext: ActionContext): number {
        const { value: priority, error } = this.priority.tryGetValue(actionContext.state);
        if (error) {
            return -1;
        }
        return priority;
    }

    /**
     * Add external condition to the OnCondition
     *
     * @param condition External constraint to add, it will be AND'ed to all other constraints.
     */
    addExternalCondition(condition: string): void {
        if (condition) {
            try {
                const parser = new ExpressionParser();
                this._extraConstraints.push(parser.parse(condition));
                this._fullConstraint = undefined;
            } catch (err) {
                throw Error(`Invalid constraint expression: ${condition}, ${err.toString()}`);
            }
        }
    }

    /**
     * Method called to execute the condition's actions.
     *
     * @param actionContext Context.
     * @returns A promise with plan change list.
     */
    async execute(actionContext: ActionContext): Promise<ActionChangeList[]> {
        if (this.runOnce) {
            const count = actionContext.state.getValue(DialogPath.eventCounter);
            actionContext.state.setValue(`${AdaptiveDialog.conditionTracker}.${this.id}.lastRun`, count);
        }
        return [this.onCreateChangeList(actionContext)];
    }

    /**
     * Get child dialog dependencies so they can be added to the containers dialogset.
     *
     * @returns A list of [Dialog](xref:botbuilder-dialogs.Dialog).
     */
    getDependencies(): Dialog[] {
        return [this.actionScope];
    }

    /**
     * Create the expression for this condition.
     *
     * @returns {Expression} Expression used to evaluate this rule.
     */
    protected createExpression(): Expression {
        const allExpressions: Expression[] = [];

        if (this.condition) {
            allExpressions.push(this.condition.toExpression());
        }

        if (this._extraConstraints?.length) {
            allExpressions.push(...this._extraConstraints);
        }

        if (this.runOnce) {
            const evaluator = new ExpressionEvaluator(
                `runOnce${this.id}`,
                (_expression, state: DialogStateManager, _) => {
                    const basePath = `${AdaptiveDialog.conditionTracker}.${this.id}.`;
                    const lastRun: number = state.getValue(basePath + 'lastRun');
                    const paths: string[] = state.getValue(basePath + 'paths');
                    const changed = state.anyPathChanged(lastRun, paths);
                    return { value: changed, error: undefined };
                },
                ReturnType.Boolean,
                FunctionUtils.validateUnary
            );
            allExpressions.push(
                new Expression(
                    ExpressionType.Ignore,
                    Expression.lookup(ExpressionType.Ignore),
                    new Expression(evaluator.type, evaluator)
                )
            );
        }

        if (allExpressions.length) {
            return Expression.andExpression(...allExpressions);
        }

        return new Constant(true);
    }

    /**
     * @protected
     * Called when a change list is created.
     * @param actionContext [ActionContext](xref:botbuilder-dialogs-adaptive.ActionContext) to use for evaluation.
     * @param dialogOptions Optional. Object with dialog options.
     * @returns An [ActionChangeList](xref:botbuilder-dialogs-adaptive.ActionChangeList) with the list of actions.
     */
    protected onCreateChangeList(actionContext: ActionContext, dialogOptions?: any): ActionChangeList {
        const actionState: ActionState = {
            dialogId: this.actionScope.id,
            options: dialogOptions,
            dialogStack: [],
        };

        const changeList: ActionChangeList = {
            changeType: ActionChangeType.insertActions,
            actions: [actionState],
        };

        return changeList;
    }
}
