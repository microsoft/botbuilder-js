/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogDependencies, Configurable } from 'botbuilder-dialogs';
import { Expression, ExpressionParserInterface, ExpressionType, Constant, ExpressionEngine } from 'botframework-expressions';
import { SequenceContext, ActionChangeList, ActionState, ActionChangeType } from '../sequenceContext';
import { ActionScope } from '../actions/actionScope';

export interface OnConditionConfiguration {
    condition?: string;
    actions?: Dialog[];
    priority?: string;
    runOnce?: boolean;
}

export class OnCondition extends Configurable implements DialogDependencies {
    
    public static declarativeType = 'Microsoft.OnCondition';

    /**
     * Evaluates the rule and returns a predicted set of changes that should be applied to the
     * current plan.
     * @param planning Planning context object for the current conversation.
     * @param event The current event being evaluated.
     * @param preBubble If `true`, the leading edge of the event is being evaluated.
     */
    // evaluate(planning: SequenceContext, event: DialogEvent, preBubble: boolean): Promise<ActionChangeList[] | undefined>;

    private _actionScope: ActionScope;
    private _extraConstraints: Expression[] = [];
    private _fullConstraint: Expression;
    private _priorityString: string;
    private _priorityExpression: Expression;

    /**
     * Gets or sets the condition which needs to be met for the actions to be executed (OPTIONAL).
     */
    public condition: string;

    /**
     * Gets or sets the actions to add to the plan when the rule constraints are met.
     */
    public actions: Dialog[] = [];

    /**
     * Get thr rule priority expression where 0 is the highest and less than 0 is ignored.
     */
    public get priority(): string {
        return this._priorityString;
    }

    /**
     * Set thr rule priority expression where 0 is the highest and less than 0 is ignored.
     */
    public set priority(value: string) {
        this._priorityExpression = undefined;
        this._priorityString = value;
    }

    /**
     * A value indicating whether rule should only run once per unique set of memory paths.
     */
    public runOnce: boolean;

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
        super();
        this.condition = condition;
        this.actions = actions;
    }

    public configure(config: OnConditionConfiguration): this {
        return super.configure(config);
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

            if (allExpressions.length > 0) {
                this._fullConstraint = Expression.andExpression(...allExpressions);
            } else {
                this._fullConstraint = new Constant(true);
            }
        }

        if (!this._priorityExpression) {
            this._priorityExpression = parser.parse(this.priority);
        }

        return this._fullConstraint;
    }

    /**
     * Compute the current value of the priority expression and return it.
     * @param context Context to use for evaluation.
     * @returns Computed priority.
     */
    public currentPriority(context: SequenceContext): number {
        const { value, error } = this._priorityExpression.tryEvaluate(context.state);
        if (error || isNaN(value)) {
            return -1;
        }
        return value;
    }

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
        return [this.onCreateChangeList(planningContext)];
    }

    /**
     * Get child dialog dependencies so they can be added to the containers dialogset.
     */
    public getDependencies(): Dialog[] {
        return [this.actionScope];
    }

    protected onCreateChangeList(planningContext: SequenceContext, dialogOptions?: any): ActionChangeList {
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
