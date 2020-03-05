/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogDependencies, Dialog, DialogContext, Configurable } from 'botbuilder-dialogs';
import { Expression, ExpressionEngine } from 'adaptive-expressions';
import { ActionScope } from './actionScope';
import { Case } from './case';
import { BoolExpression } from '../expressionProperties';

export interface SwitchConditionConfiguration extends DialogConfiguration {
    condition?: string;
    default?: Dialog[];
    cases?: Case[];
    disabled?: string | boolean;
}

export class SwitchCondition<O extends object = {}> extends Dialog<O> implements DialogDependencies, Configurable {
    public static declarativeType = 'Microsoft.SwitchCondition';

    public constructor();
    public constructor(condition: string, defaultDialogs: Dialog[], cases: Case[]);
    public constructor(condition?: string, defaultDialogs?: Dialog[], cases?: Case[]) {
        super();
        if (condition) { this.condition = new ExpressionEngine().parse(condition); }
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

    public configure(config: SwitchConditionConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'condition':
                        this.condition = new ExpressionEngine().parse(value);
                        break;
                    case 'cases':
                        this.cases = (value as Case[]).map(v => new Case(v.value, v.actions));
                        break;
                    case 'disabled':
                        this.disabled = new BoolExpression(value);
                        break;
                    default:
                        super.configure({ [key]: value });
                        break;
                }
            }
        }

        return this;
    }

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
