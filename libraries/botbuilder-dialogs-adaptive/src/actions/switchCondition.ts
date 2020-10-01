/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogDependencies, Dialog, DialogContext } from 'botbuilder-dialogs';
import { Expression, ExpressionParser } from 'adaptive-expressions';
import { ActionScope } from './actionScope';
import { Case } from './case';
import { BoolExpression } from 'adaptive-expressions';

/**
 * Conditional branch with multiple cases.
 */
export class SwitchCondition<O extends object = {}> extends Dialog<O> implements DialogDependencies {
    public constructor();

    /**
     * Initializes a new instance of the `SwitchCondition` class
     * @param condition Condition expression against memory.
     * @param defaultDialogs Default case.
     * @param cases Cases.
     */
    public constructor(condition: string, defaultDialogs: Dialog[], cases: Case[]);

    /**
     * Initializes a new instance of the `SwitchCondition` class
     * @param condition Optional. Condition expression against memory.
     * @param defaultDialogs Optional. Default case.
     * @param cases Optional. Cases.
     */
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

    private _caseExpresssions: any;

    private _defaultScope: ActionScope;

    /**
     * Gets the child dialog dependencies so they can be added to the containers dialog set.
     * @returns The child dialog dependencies.
     */
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

    /**
     * Starts a new dialog and pushes it onto the dialog stack.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (!this._caseExpresssions) {
            this._caseExpresssions = {};
            for (let i = 0; i < this.cases.length; i++) {
                const caseScope = this.cases[i];
                const caseCondition = Expression.equalsExpression(this.condition, caseScope.createValueExpression());
                this._caseExpresssions[caseScope.value] = caseCondition;
            }
        }

        let actionScope = this.defaultScope;

        for (let i = 0; i < this.cases.length; i++) {
            const caseScope = this.cases[i];
            const caseCondition = this._caseExpresssions[caseScope.value] as Expression;
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

    /**
     * @protected
     * Gets the default scope.
     * @returns An `ActionScope` with the scope.
     */
    protected get defaultScope(): ActionScope {
        if (!this._defaultScope) {
            this._defaultScope = new ActionScope(this.default);
        }
        return this._defaultScope;
    }

    /**
     * @protected
     * Builds the compute Id for the dialog.
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `SwitchCondition[${ this.condition.toString() }]`;
    }
}
