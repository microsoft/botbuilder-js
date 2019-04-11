
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

        // tslint:disable-next-line: switch-default
        switch (name) {
            case 'lgTemplate':
                return new ExpressionEvaluator(BuiltInFunctions.Apply(this.lgTemplate), ReturnType.String, this.ValidLgTemplate);
            case 'join':
                return new ExpressionEvaluator(BuiltInFunctions.Apply(this.Join));
        }

        return BuiltInFunctions.Lookup(name);
    }

    public lgTemplate = (paramters: any[]): any => {
        if (paramters.length > 0 &&
            typeof paramters[0] === 'string') {
            const func: string = paramters[0];
            const templateParameters: any[] = paramters.slice(1);

            if (func !== undefined &&
                func.length > 0 &&
                func in this.evaluator.TemplateMap) {
                const newScope: any = this.evaluator.ConstructScope(func, templateParameters);

                return this.evaluator.EvaluateTemplate(func, newScope);
            } else {
                throw new Error(`No such template defined: ${func.substr(1, func.length - 2)}`);
            }
        }

        throw new Error('NotImplementedException');
    }

    public ValidLgTemplate = (expression: Expression): void  => {
        if (expression.Children.length === 0) {
            throw new Error('lgTemplate requires 1 or more arguments');
        }

        if (!(expression.Children[0] instanceof Constant)
            || typeof (expression.Children[0] as Constant).Value !== 'string') {
                throw new Error(`lgTemplate expect a string as first argument, acutal ${expression.Children[0]}`);
        }

        const templateName: string = (expression.Children[0] as Constant).Value;
        if (!(templateName in this.evaluator.TemplateMap)) {
            throw new Error(`no such template '${templateName}' to call in ${expression}`);
        }

        const expectedArgsCount: number = this.evaluator.TemplateMap[templateName].Parameters.length;
        const actualArgsCount: number = expression.Children.length - 1;

        if (expectedArgsCount !== actualArgsCount) {
            throw new Error(`arguments mismatch for template ${templateName}, expect ${expectedArgsCount} actual ${actualArgsCount}`);
        }
    }

    public Join = (paramters: any[]): any => {
        if (paramters.length === 2 &&
            paramters[0] instanceof Array &&
            typeof (paramters[1]) === 'string') {
            const li: any = paramters[0];
            const sep: string = paramters[1].concat(' ');

            return li.join(sep);
        }

        if (paramters.length === 3 &&
            paramters[0] instanceof Array &&
            typeof (paramters[1]) === 'string' &&
            typeof (paramters[2]) === 'string') {
            const li: any = paramters[0];
            const sep1: string = paramters[1].concat(' ');
            const sep2: string = ' '.concat(paramters[2], ' ');
            if (li.length < 3) {
                return li.join(sep2);
            } else {
                const firstPart: string = li.slice(0, li.length - 1).join(sep1);

                return firstPart.concat(sep2, li[li.length - 1]);
            }
        }

        throw new Error('NotImplementedException');
    }

    public Foreach = (paramters: any[]): any => {
        if (paramters.length === 2 &&
            paramters[0] instanceof Array &&
            typeof (paramters[1]) === 'string') {
            const li: any[] = paramters[0];
            let func: string = paramters[1];

            if (!this.IsTemplateRef(func) || !(func.substr(1, func.length - 2) in this.evaluator.TemplateMap)) {
                throw new Error(`No such template defined: ${func}`);
            }

            func = func.substr(1, func.length - 2);

            return li.map((x: any) => {
                const newScope: any = this.evaluator.ConstructScope(func, [x]);

                return this.evaluator.EvaluateTemplate(func, newScope);
            });

        }
        throw new Error('NotImplementedException');
    }

    public ForeachThenJoin = (paramters: any[]): any => {
        if (paramters.length >= 2 &&
            paramters[0] instanceof Array &&
            typeof paramters[1] === 'string') {
            const li: any[] = paramters[0];
            let func: string = paramters[1];

            func = func.substr(1, func.length - 2);
            if (!(func in this.evaluator.TemplateMap)) {
                throw new Error(`No such template defined: ${func}`);
            }

            const result: string[] = li.map((x: any) => {
                const newScope: any = this.evaluator.ConstructScope(func, [x]);

                return this.evaluator.EvaluateTemplate(func, newScope);
            });

            const newParameter: any = paramters.slice(1);
            newParameter[0] = result;

            return this.Join(newParameter);

        }
        throw new Error('NotImplementedException');
    }

    private readonly IsTemplateRef = (templateName: string): boolean => {
        if (templateName === undefined || templateName.trim() === '') {
            return false;
        } else if (templateName.startsWith('[') && templateName.endsWith(']')) {
            return true;
        }

        return false;
    }
}
