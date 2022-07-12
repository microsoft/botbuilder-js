/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogListConverter } from '../converters';
import { ActionScope } from './actionScope';
import { Case } from './case';

import {
    BoolExpression,
    BoolExpressionConverter,
    Constant,
    Expression,
    ExpressionConverter,
    ExpressionParser,
    ValueExpression,
} from 'adaptive-expressions';

import { BoolProperty, Property } from '../properties';

import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogDependencies,
    DialogTurnResult,
} from 'botbuilder-dialogs';

type CaseInput = {
    actions: Dialog[];
    value: string;
};

class CasesConverter implements Converter<Array<CaseInput | Case>, Case[]> {
    convert(items: Array<CaseInput | Case>): Case[] {
        return items.map(
            (item: CaseInput | Case): Case => (item instanceof Case ? item : new Case(item.value, item.actions))
        );
    }
}

/**
 * Conditional branch with multiple cases.
 */
export interface SwitchConditionConfiguration extends DialogConfiguration {
    condition?: Property;
    default?: string[] | Dialog[];
    cases?: CaseInput[] | Case[];
    disabled?: BoolProperty;
}

/**
 * Conditional branch with multiple cases.
 */
export class SwitchCondition<O extends object = {}>
    extends Dialog<O>
    implements DialogDependencies, SwitchConditionConfiguration {
    static $kind = 'Microsoft.SwitchCondition';

    constructor();

    /**
     * Initializes a new instance of the [SwitchCondition](xref:botbuilder-dialogs-adaptive.SwitchCondition) class
     *
     * @param condition Condition expression against memory.
     * @param defaultDialogs Default [Dialog](xref:botbuilder-dialogs.Dialog) array.
     * @param cases Cases.
     */
    constructor(condition: string, defaultDialogs: Dialog[], cases: Case[]);

    /**
     * Initializes a new instance of the [SwitchCondition](xref:botbuilder-dialogs-adaptive.SwitchCondition) class
     *
     * @param condition Optional. Condition expression against memory.
     * @param defaultDialogs Optional. Default [Dialog](xref:botbuilder-dialogs.Dialog) array.
     * @param cases Optional. Cases.
     */
    constructor(condition?: string, defaultDialogs?: Dialog[], cases?: Case[]) {
        super();
        if (condition) {
            this.condition = new ExpressionParser().parse(condition);
        }
        if (defaultDialogs) {
            this.default = defaultDialogs;
        }
        if (cases) {
            this.cases = cases;
        }
    }

    /**
     * Condition expression against memory.
     */
    condition: Expression;

    /**
     * Default case.
     */
    default: Dialog[] = [];

    /**
     * Cases.
     */
    cases: Case[] = [];

    /**
     * An optional expression which if is true will disable this action.
     */
    disabled?: BoolExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof SwitchConditionConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'condition':
                return new ExpressionConverter();
            case 'default':
                return DialogListConverter;
            case 'cases':
                return new CasesConverter();
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    private _caseExpresssions: Map<string, Expression>;

    private _defaultScope: ActionScope;

    /**
     * Gets the child [Dialog](xref:botbuilder-dialogs.Dialog) dependencies so they can be added to the containers [Dialog](xref:botbuilder-dialogs.Dialog) set.
     *
     * @returns The child [Dialog](xref:botbuilder-dialogs.Dialog) dependencies.
     */
    getDependencies(): Dialog[] {
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
     * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param _options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, _options?: O): Promise<DialogTurnResult> {
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
                    this._caseExpresssions.set(
                        caseScope.value,
                        Expression.orExpression(
                            Expression.equalsExpression(this.condition, new Constant(intVal)),
                            Expression.equalsExpression(this.condition, new Constant(caseScope.value))
                        )
                    );
                    continue;
                }
                const floatVal = parseFloat(caseScope.value);
                if (!isNaN(floatVal)) {
                    // you don't have to put quotes around numbers, "23" => 23 OR "23".
                    this._caseExpresssions.set(
                        caseScope.value,
                        Expression.orExpression(
                            Expression.equalsExpression(this.condition, new Constant(floatVal)),
                            Expression.equalsExpression(this.condition, new Constant(caseScope.value))
                        )
                    );
                    continue;
                }
                const caseValue = caseScope.value.trim().toLowerCase();
                if (caseValue === 'true') {
                    // you don't have to put quotes around bools, "true" => true OR "true".
                    this._caseExpresssions.set(
                        caseScope.value,
                        Expression.orExpression(
                            Expression.equalsExpression(this.condition, new Constant(true)),
                            Expression.equalsExpression(this.condition, new Constant(caseScope.value))
                        )
                    );
                    continue;
                }
                if (caseValue === 'false') {
                    // you don't have to put quotes around bools, "false" => false OR "false".
                    this._caseExpresssions.set(
                        caseScope.value,
                        Expression.orExpression(
                            Expression.equalsExpression(this.condition, new Constant(false)),
                            Expression.equalsExpression(this.condition, new Constant(caseScope.value))
                        )
                    );
                    continue;
                }
                // if someone does "=23" that will be numeric comparison or "='23'" that will be string comparison,
                // or it can be a real expression bound to memory.
                const { value } = new ValueExpression(caseScope.value).tryGetValue(dc.state);
                this._caseExpresssions.set(
                    caseScope.value,
                    Expression.equalsExpression(this.condition, new Constant(value))
                );
            }
        }

        let actionScope = this.defaultScope;

        for (let i = 0; i < this.cases.length; i++) {
            const caseScope = this.cases[i];
            const caseCondition = this._caseExpresssions.get(caseScope.value) as Expression;
            const { value, error } = caseCondition.tryEvaluate(dc.state);
            if (error) {
                throw new Error(
                    `Expression evaluation resulted in an error. Expression: ${caseCondition.toString()}. Error: ${error}`
                );
            }

            if (value) {
                actionScope = caseScope;
            }
        }

        return await dc.replaceDialog(actionScope.id);
    }

    /**
     * @protected
     * Gets the default scope.
     * @returns An [ActionScope](xref:botbuilder-dialogs-adaptive.ActionScope) with the scope.
     */
    protected get defaultScope(): ActionScope {
        if (!this._defaultScope) {
            this._defaultScope = new ActionScope(this.default);
        }
        return this._defaultScope;
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `SwitchCondition[${this.condition.toString()}]`;
    }
}
