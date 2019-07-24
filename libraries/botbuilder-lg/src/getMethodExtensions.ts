
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

       // tslint:disable-next-line: switch-default
       switch (name) {
           case 'join':
               return new ExpressionEvaluator('join', BuiltInFunctions.Apply(this.Join));
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

    public Join = (paramters: any[]): any => {
        if (paramters.length === 2 &&
            paramters[0] instanceof Array &&
            typeof (paramters[1]) === 'string') {
            const li: any = paramters[0].map((p: any) => p instanceof Array ? p[0] : p);
            const sep: string = paramters[1];

            return li.join(sep);
        }

        if (paramters.length === 3 &&
            paramters[0] instanceof Array &&
            typeof (paramters[1]) === 'string' &&
            typeof (paramters[2]) === 'string') {
            const li: any = paramters[0].map((p: any) => p instanceof Array ? p[0] : p);
            const sep1: string = paramters[1];
            const sep2: string = paramters[2];
            if (li.length < 3) {
                return li.join(sep2);
            } else {
                const firstPart: string = li.slice(0, li.length - 1).join(sep1);

                return firstPart.concat(sep2, li[li.length - 1]);
            }
        }

        throw new Error('NotImplementedException');
    }
}
