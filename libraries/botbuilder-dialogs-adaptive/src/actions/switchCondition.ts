/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration } from 'botbuilder-dialogs';
import { Case } from './case';
import { Dialog } from 'botbuilder-dialogs';
import { Expression, ExpressionType } from 'botframework-expressions';
import { ActionState, SequenceContext, ActionChangeType, ActionChangeList } from '../sequenceContext';

export interface SwitchConditionConfiguration extends DialogConfiguration {
    /**
     * The in-memory property to set.
     */
    condition?: Expression;

    default?: Dialog[];

}

export class SwitchCondition<O extends object = {}> extends Dialog<O> {

    private caseExpresssions = {};

    public condition: Expression;

    public default: Dialog[];

    public cases: Case[];

    constructor();
    constructor(condition: Expression, defaultDialogs: Dialog[], cases: Case[]);
    constructor(condition?: Expression, defaultDialogs?: Dialog[], cases?: Case[]) {
        super();
        if (condition) { this.condition = condition; }
        if (defaultDialogs) { this.default = defaultDialogs; }
        if (cases) { this.cases = cases; }
    }

    protected onComputeId(): string {
        return `SwitchCondition[${this.condition}]`;
    }

    public configure(config: SwitchConditionConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(sc: SequenceContext, options: O): Promise<DialogTurnResult> {
        if (!(sc instanceof SequenceContext)) { throw new Error(`${this.id}: should only be used within an AdaptiveDialog.`) }

        if (this.condition) {
            if (this.caseExpresssions === null) {
                this.caseExpresssions = {};
                this.cases.forEach(c => {
                    const expr = new Expression(ExpressionType.Equal, undefined, c.CreateValueExpression());
                    expr.validate();
                    const caseCondition = expr;
                    this.caseExpresssions[c.value] = caseCondition;
                });
            }
        }

        var actionsToRun = this.default;

        for (var caseCondition of this.cases) {
            var value, error = (this.caseExpresssions[caseCondition.value] as Expression).tryEvaluate(sc.state);
            if (error != null) {
                throw new Error(`Expression evaluation resulted in an error.
                 Expression: ${this.caseExpresssions[caseCondition.value].ToString()}. Error: ${error}`);
            }

            if (value as boolean) {
                actionsToRun = caseCondition.actions;
                break;
            }
        }

        var planActions = actionsToRun.map(s => ({
            "dialogStack": [],
            "dialogId": s.id,
            "options": options,
        } as ActionState));

        sc.queueChanges({
            changeType: ActionChangeType.insertActions,
            actions: planActions
        } as ActionChangeList);

        return await sc.endDialog();
    }
}
