/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BoolExpression, Constant, Expression, ExpressionParser, ValueExpression } from 'adaptive-expressions';
import { DialogTurnResult, DialogDependencies, Dialog, DialogContext } from 'botbuilder-dialogs';
import { ActionScope } from './actionScope';
import { Case } from './case';

export class SwitchCondition<O extends object = {}> extends Dialog<O> implements DialogDependencies {
    public constructor();
    public constructor(condition: string, defaultDialogs: Dialog[], cases: Case[]);
    public constructor(condition?: string, defaultDialogs?: Dialog[], cases?: Case[]) {
        super();
        if (condition) { this.condition = new ExpressionParser().parse(condition); }
        if (defaultDialogs) { this.default = defaultDialogs; }
        if (cases) { this.cases = cases; }
    }

    /**
     * Condition expression against memory.
     */
    public condition: Expression;

    /**
     * Default case.
     */
    public default: Dialog[] = [];

    /**
     * Cases.
     */
    public cases: Case[] = [];

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    private _caseExpresssions: Map<string, Expression>;

    private _defaultScope: ActionScope;

    public getDependencies(): Dialog[] {
        let dialogs: Dialog[] = [];
        if (this.default) {
            dialogs = dialogs.concat(this.defaultScope);
        }

        if (this.cases) {
            dialogs = dialogs.concat(this.cases);
        }
        return dialogs;
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (!this._caseExpresssions) {
            this._caseExpresssions = new Map<string, Expression>();
            for (let i = 0; i < this.cases.length; i++) {
                const caseScope = this.cases[i];
                const intVal = parseInt(caseScope.value, 10);
                if (!isNaN(intVal)) {
                    // you don't have to put quotes around numbers, "23" => 23 OR "23".
                    this._caseExpresssions.set(caseScope.value, Expression.orExpression(
                        Expression.equalsExpression(this.condition, new Constant(intVal)),
                        Expression.equalsExpression(this.condition, new Constant(caseScope.value))
                    ));
                    continue;
                }
                const floatVal = parseFloat(caseScope.value);
                if (!isNaN(floatVal)) {
                    // you don't have to put quotes around numbers, "23" => 23 OR "23".
                    this._caseExpresssions.set(caseScope.value, Expression.orExpression(
                        Expression.equalsExpression(this.condition, new Constant(floatVal)),
                        Expression.equalsExpression(this.condition, new Constant(caseScope.value))
                    ));
                    continue;
                }
                const caseValue = caseScope.value.trim().toLowerCase();
                if (caseValue === 'true') {
                    // you don't have to put quotes around bools, "true" => true OR "true".
                    this._caseExpresssions.set(caseScope.value, Expression.orExpression(
                        Expression.equalsExpression(this.condition, new Constant(true)),
                        Expression.equalsExpression(this.condition, new Constant(caseScope.value))
                    ));
                    continue;
                }
                if (caseValue === 'false') {
                    // you don't have to put quotes around bools, "false" => false OR "false".
                    this._caseExpresssions.set(caseScope.value, Expression.orExpression(
                        Expression.equalsExpression(this.condition, new Constant(false)),
                        Expression.equalsExpression(this.condition, new Constant(caseScope.value))
                    ));
                    continue;
                }
                // if someone does "=23" that will be numeric comparison or "='23'" that will be string comparison,
                // or it can be a real expression bound to memory.
                const { value } = new ValueExpression(caseScope.value).tryGetValue(dc.state);
                this._caseExpresssions.set(caseScope.value, Expression.equalsExpression(this.condition, new Constant(value)));
            }
        }

        let actionScope = this.defaultScope;

        for (let i = 0; i < this.cases.length; i++) {
            const caseScope = this.cases[i];
            const caseCondition = this._caseExpresssions.get(caseScope.value) as Expression;
            const { value, error } = caseCondition.tryEvaluate(dc.state);
            if (error) {
                throw new Error(`Expression evaluation resulted in an error. Expression: ${ caseCondition.toString() }. Error: ${ error }`);
            }

            if (!!value) {
                actionScope = caseScope;
            }
        }

        return await dc.replaceDialog(actionScope.id);
    }

    protected get defaultScope(): ActionScope {
        if (!this._defaultScope) {
            this._defaultScope = new ActionScope(this.default);
        }
        return this._defaultScope;
    }

    protected onComputeId(): string {
        return `SwitchCondition[${ this.condition.toString() }]`;
    }
}
