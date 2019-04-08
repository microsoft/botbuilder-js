import { BuiltInFunctions, ExpressionEvaluator } from 'botbuilder-expression';
import { Expander } from './expander';

export interface IGetMethod {
    GetMethodX(name: string): ExpressionEvaluator;
}

export class GetExpanderMethod implements IGetMethod {
    private readonly expander: Expander;

    public constructor(expander: Expander) {
        this.expander = expander;
    }

    public GetMethodX(name: string): ExpressionEvaluator {

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

    public Count(paramters: any[]): any {
        if (paramters[0] instanceof Array) {
            const li: any = paramters[0];

            return li.length;
        }
        throw new Error('NotImplementedException');
    }

    public Join(paramters: any[]): any {
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
            const func: any = paramters[1];

            if (!this.expander.Context.TemplateContexts.has(func)) {
                throw new Error(`No such template defined: ${func}`);
            }

            return li.map((x: any) => {
                const newScope: any = this.expander.ConstructScope(func, [x]);

                return this.expander.ExpandTemplate(func, newScope)[0];
            });

        }
        throw new Error('NotImplementedException');
    }

    public ForeachThenJoin = (paramters: any[]): any => {
        if (paramters.length >= 2 &&
            paramters[0] instanceof Array &&
            typeof paramters[1] === 'string') {
            const li: any[] = paramters[0];
            const func = paramters[1];

            if (!this.expander.Context.TemplateContexts.has(func)) {
                throw new Error(`No such template defined: ${func}`);
            }

            const result = li.map((x: any) => {
                const newScope: any = this.expander.ConstructScope(func, [x]);

                return this.expander.ExpandTemplate(func, newScope)[0];
            });

            const newParameter: any = paramters.slice(1);
            newParameter[0] = result;

            return this.Join(newParameter);

        }
        throw new Error('NotImplementedException');
    }
}
