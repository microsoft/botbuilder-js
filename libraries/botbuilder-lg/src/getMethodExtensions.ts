import { ExpressionEvaluator, BuiltInFunctions } from 'botbuilder-expression';
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
            case 'count':
                return new ExpressionEvaluator(BuiltInFunctions.Apply(this.Count));
            case 'join':
                return new ExpressionEvaluator(BuiltInFunctions.Apply(this.Join));
            case 'foreach':
            case 'map':
                return new ExpressionEvaluator(BuiltInFunctions.Apply(this.Foreach));
            case 'mapjoin':
            case 'humanize':
                return new ExpressionEvaluator(BuiltInFunctions.Apply(this.ForeachThenJoin));
        }

        return BuiltInFunctions.Lookup(name);
    }

    public Count = (paramters: any[]): any => {
        if (paramters[0] instanceof Array) {
            const li: any = paramters[0];

            return li.length;
        }
        throw new Error('NotImplementedException');
    }

    public Join = (paramters: any[]): any => {
        if (paramters.length === 2 &&
            paramters[0] instanceof Array &&
            typeof (paramters[1]) === 'string') {
            const li: any = paramters[0];
            const sep: string = paramters[1] + ' ';

            return li.join(sep);
        }

        if (paramters.length === 3 &&
            paramters[0] instanceof Array &&
            typeof (paramters[1]) === 'string' &&
            typeof (paramters[2] === 'string')) {
            const li: any = paramters[0];
            const sep1: string = paramters[1] + ' ';
            const sep2: string = ' ' + paramters[2] + ' ';
            if (li.length < 3) {
                return li.join(sep2);
            } else {
                const firstPart: string = li.slice(0, li.length - 1).join(sep1);

                return firstPart + sep2 + li[li.length - 1];
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

            if (!this.IsTemplateRef(func) || !this.evaluator.Context.TemplateContexts.has(func.substr(1, func.length - 2))) {
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
            if (!this.evaluator.Context.TemplateContexts.has(func)) {
                throw new Error(`No such template defined: ${func}`);
            }

            const result = li.map((x: any) => {
                const newScope: any = this.evaluator.ConstructScope(func, [x]);

                return this.evaluator.EvaluateTemplate(func, newScope);
            });

            const newParameter: any = paramters.slice(1);
            newParameter[0] = result;

            return this.Join(newParameter);

        }
        throw new Error('NotImplementedException');
    }

    private IsTemplateRef = (templateName: string): boolean => {
        if (templateName === undefined || templateName.trim() === '') {
            return false;
        } else if (templateName.startsWith('[') && templateName.endsWith(']')) {
            return true;
        }

        return false;
    }
}
