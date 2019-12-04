/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, Dialog } from 'botbuilder-dialogs';
import { Expression, ExpressionType, Constant } from 'botframework-expressions';
import { ExpressionPropertyValue, ExpressionProperty } from '../expressionProperty';
import { ActionScope } from './actionScope';
import { Case } from './case';

export interface CaseConfiguration {
    value: string|Constant;

    actions: Dialog[];
}

export interface SwitchConditionConfiguration extends DialogConfiguration {
    condition?: ExpressionPropertyValue<any>;

    cases?: CaseConfiguration[];

    default?: Dialog[];
}

export class SwitchCondition<O extends object = {}> extends Dialog<O> {
    private compiled: CompiledCase[];

    public condition: ExpressionProperty<any>;

    public default?: Dialog[];

    public cases: Case[] = [];

    constructor(condition?: ExpressionPropertyValue<any>) {
        super();
        if (condition) { this.condition = new ExpressionProperty(condition) }
    }

    public addCase(value: string, actions: Dialog[]): this {
        this.cases.push(new Case(value, actions));
        return this;
    }

    protected onComputeId(): string {
        return `SwitchCondition[${this.condition.toString()}]`;
    }

    public configure(config: SwitchConditionConfiguration): this {
        return super.configure(config);
    }

    public getDependencies(): Dialog[] {
        // Compile cases
        this.compileCases();

        // Assembly and return list of dependencies
        let dialogs: Dialog[] = [];
        this.compiled.forEach((v) => {
            dialogs.push(v.actionScope);
            dialogs = dialogs.concat(v.actions);
        });

        return dialogs;
    }

    public async beginDialog(dc: DialogContext, options: O): Promise<DialogTurnResult> {
        // Find matching case
        for (const caseCondition of this.compiled) {
            // Do we have a conditional expression?
            if (caseCondition.expression) {
                const value = caseCondition.expression.evaluate(this.id, dc.state);
                if (value) {
                    // Transfer control to matched condition
                    return await dc.replaceDialog(caseCondition.actionScope.id);
                }
            } else {
                // Transfer control to default condition
                return await dc.replaceDialog(caseCondition.actionScope.id);
            }
        }

        // No conditions matched
        return await dc.endDialog();
    }

    private compileCases(): void {
        // Compile cases first
        this.compiled = this.cases.map((v) => {
            // Create conditional test
            const expr = new Expression(ExpressionType.Equal, undefined, this.condition.expression, v.CreateValueExpression());
            expr.validate();

            // Return compiled case
            return {
                expression: new ExpressionProperty(expr),
                actionScope: new ActionScope(v.actions),
                actions: v.actions
            };
        });

        // Append default condition
        if (Array.isArray(this.default) && this.default.length > 0) {
            this.compiled.push({
                actionScope: new ActionScope(this.default),
                actions: this.default
            });
        }
    }
}

/**
 * @private
 */
interface CompiledCase {
    expression?: ExpressionProperty<boolean>;

    actionScope: Dialog;

    actions: Dialog[];
}