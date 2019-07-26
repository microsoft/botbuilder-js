
/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BuiltInFunctions, ExpressionEvaluator, ReturnType, Expression, Constant } from 'botbuilder-expression';
import { Evaluator } from './evaluator';

export interface IGetMethod {
    GetMethodX(name: string): ExpressionEvaluator;
}

export class GetMethodExtensions implements IGetMethod {
    private readonly evaluator: Evaluator;

    public constructor(evaluator: Evaluator) {
        this.evaluator = evaluator;
    }

    public GetMethodX = (name: string): ExpressionEvaluator => {

       // user can always choose to use builtin.xxx to disambiguate with template xxx
       const builtInPrefix: string = 'builtin.';
       if (name.startsWith(builtInPrefix)) {
           return BuiltInFunctions.Lookup(name.substr(builtInPrefix.length));
       }

       if (name in this.evaluator.TemplateMap) {
           return new ExpressionEvaluator(
               name,
               BuiltInFunctions.Apply(this.TemplateEvaluator(name)),
               ReturnType.String,
               this.ValidTemplateReference);
       }

       return BuiltInFunctions.Lookup(name);
    }

    public TemplateEvaluator = (templateName: string): any =>
    (args: any[]): string => {
        const newScope: any = this.evaluator.ConstructScope(templateName, args);

        return this.evaluator.EvaluateTemplate(templateName, newScope);
    }

    public ValidTemplateReference = (expression: Expression): void  => {
        const templateName: string = expression.Type;

        if (!(templateName in this.evaluator.TemplateMap)) {
            throw new Error(`no such template '${templateName}' to call in ${expression}`);
        }

        const expectedArgsCount: number = this.evaluator.TemplateMap[templateName].Parameters.length;
        const actualArgsCount: number = expression.Children.length;

        if (expectedArgsCount !== actualArgsCount) {
            throw new Error(`arguments mismatch for template ${templateName}, expect ${expectedArgsCount} actual ${actualArgsCount}`);
        }
    }
}
