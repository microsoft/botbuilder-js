
/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line: no-submodule-imports
import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import { BuiltInFunctions, ExpressionEvaluator, ReturnType, Expression, Constant } from 'botbuilder-expression';
import { ExpressionEngine} from 'botbuilder-expression-parser';
import { keyBy } from 'lodash';
import { EvaluationTarget } from './evaluator';
import * as lp from './generated/LGFileParser';
import { LGFileParserVisitor } from './generated/LGFileParserVisitor';
import { LGTemplate } from './lgTemplate';

// tslint:disable-next-line: max-classes-per-file
export class Expander extends AbstractParseTreeVisitor<string[]> implements LGFileParserVisitor<string[]> {
    public readonly Templates: LGTemplate[];
    public readonly TemplateMap: {[name: string]: LGTemplate};
    private readonly evalutationTargetStack: EvaluationTarget[] = [];

    private readonly GetMethodX: IGetMethod;

    constructor(templates: LGTemplate[], getMethod: IGetMethod) {
        super();
        this.Templates = templates;
        this.TemplateMap = keyBy(templates, (t: LGTemplate) => t.Name);
        this.GetMethodX = getMethod === undefined ? new GetExpanderMethod(this) : getMethod;
    }

    public ExpandTemplate(templateName: string, scope: any): string[] {
        if (!(templateName in this.TemplateMap)) {
            throw new Error(`No such template: ${templateName}`);
        }

        if (this.evalutationTargetStack.find((u: EvaluationTarget) => u.TemplateName === templateName) !== undefined) {
            throw new Error(`Loop deteced: ${this.evalutationTargetStack.reverse()
                .map((u: EvaluationTarget) => u.TemplateName)
                .join(' => ')}`);
        }

        this.evalutationTargetStack.push(new EvaluationTarget(templateName, scope));
        const result: string[] = this.visit(this.TemplateMap[templateName].ParseTree);
        this.evalutationTargetStack.pop();

        return result;
    }

    public visitTemplateDefinition(ctx: lp.TemplateDefinitionContext): string[] {
        const templateNameContext: lp.TemplateNameLineContext = ctx.templateNameLine();
        if (templateNameContext.templateName().text === this.currentTarget().TemplateName) {
            return this.visit(ctx.templateBody());
        }

        return undefined;
    }

    public visitNormalBody(ctx: lp.NormalBodyContext): string[] {
        return this.visit(ctx.normalTemplateBody());
    }

    public visitNormalTemplateBody(ctx: lp.NormalTemplateBodyContext) : string[] {
        const normalTemplateStrs: lp.NormalTemplateStringContext[] = ctx.normalTemplateString();
        let result: string[] = [];
        for (const normalTemplateStr of normalTemplateStrs) {
            result = result.concat(this.visit(normalTemplateStr));
        }

        return result;
    }

    public visitConditionalBody(ctx: lp.ConditionalBodyContext) : string[] {
        const ifRules: lp.IfConditionRuleContext[] = ctx.conditionalTemplateBody().ifConditionRule();
        for (const ifRule of ifRules) {
            if (this.EvalCondition(ifRule.ifCondition())) {
                return this.visit(ifRule.normalTemplateBody());
            }
        }

        return undefined;
    }

    public visitNormalTemplateString(ctx: lp.NormalTemplateStringContext): string[] {
        let result: string[] = [''];
        for (const node of ctx.children) {
            const innerNode: TerminalNode =  <TerminalNode>node;
            switch (innerNode.symbol.type) {
                case lp.LGFileParser.DASH: break;
                case lp.LGFileParser.ESCAPE_CHARACTER:
                    result = this.StringArrayConcat(result, [this.EvalEscapeCharacter(innerNode.text)]);
                    break;
                case lp.LGFileParser.EXPRESSION: {
                    result = this.StringArrayConcat(result, this.EvalExpression(innerNode.text));
                    break;
                }
                case lp.LGFileParser.TEMPLATE_REF: {
                    result = this.StringArrayConcat(result, this.EvalTemplateRef(innerNode.text));
                    break;
                }
                case lp.LGFileParser.MULTI_LINE_TEXT: {
                    result = this.StringArrayConcat(result, this.EvalMultiLineText(innerNode.text));
                    break;
                }
                default: {
                    result = this.StringArrayConcat(result, [innerNode.text]);
                    break;
                }
            }
        }

        return result;
    }

    public ConstructScope(templateName: string, args: any[]) : any {
        if (args.length === 1 && this.TemplateMap[templateName].Parameters.length === 0) {
            // Special case, if no parameters defined, and only one arg, don't wrap
            // this is for directly calling an paramterized template
            return args[0];
        }
        const paramters: string[] = this.TemplateMap[templateName].Parameters;

        if (paramters !== undefined && (args === undefined || paramters.length !== args.length)) {
            throw new Error(`The length of required parameters does not match the length of provided parameters.`);
        }

        const newScope: any = {};
        paramters.map((e: string, i: number) => newScope[e] = args[i]);

        return newScope;
    }

    protected defaultResult(): string[] {
        return [];
    }

    private currentTarget(): EvaluationTarget {
        return this.evalutationTargetStack[this.evalutationTargetStack.length - 1];
    }

    private EvalEscapeCharacter(exp: string): string {
        const validCharactersDict: any = {
            '\\r': '\r',
            '\\n': '\n',
            '\\t': '\t',
            '\\\\': '\\',
            '\\[': '[',
            '\\]': ']',
            '\\{': '{',
            '\\}': '}'
        };

        return validCharactersDict[exp];
    }

    private EvalCondition(condition: lp.IfConditionContext): boolean {
        const expressions: TerminalNode[] = condition.EXPRESSION();
        if (expressions === undefined || expressions.length === 0) {
            return true;    // no expression means it's else
        }

        if (this.EvalExpressionInCondition(expressions[0].text)) {
            return true;
        }

        return false;
    }

    private EvalExpressionInCondition(exp: string): boolean {
        try {
            exp = exp.replace(/(^{*)/g, '')
                .replace(/(}*$)/g, '');

            const {value: result, error}: {value: any; error: string} = this.EvalByExpressionEngine(exp, this.currentTarget().Scope);
            if (error !== undefined
                || result === undefined
                || typeof result === 'boolean' && !Boolean(result)
                || Number.isInteger(result) && Number(result) === 0) {
                    return false;
                }

            return true;
        } catch (error) {
            return false;
        }
    }

    private EvalExpression(exp: string): string[] {
        exp = exp.replace(/(^{*)/g, '')
            .replace(/(}*$)/g, '');

        const { value: result, error }: { value: any; error: string } = this.EvalByExpressionEngine(exp, this.currentTarget().Scope);
        if (error !== undefined) {
            throw new Error(`Error occurs when evaluating expression ${exp}: ${error}`);
        }
        if (result === undefined) {
            throw new Error(`Error occurs when evaluating expression '${exp}': ${exp} is evaluated to null`);
        }

        if (result instanceof Array) {
            return result;
        } else {
            return [result.toString()];
        }
    }

    private EvalTemplateRef(exp: string) : string[] {
        exp = exp.replace(/(^\[*)/g, '')
                .replace(/(\]*$)/g, '');
        const argsStartPos: number = exp.indexOf('(');
        if (argsStartPos > 0) {
            const argsEndPos: number = exp.lastIndexOf(')');
            if (argsEndPos < 0 || argsEndPos < argsStartPos + 1) {
                throw new Error(`Not a valid template ref: ${exp}`);
            }

            const argExpressions: string[] = exp.substr(argsStartPos + 1, argsEndPos - argsStartPos - 1).split(',');
            const args: any[] = argExpressions.map((x: string) => this.EvalByExpressionEngine(x, this.currentTarget().Scope).value);
            const templateName: string = exp.substr(0, argsStartPos);
            const newScope: any = this.ConstructScope(templateName, args);

            return this.ExpandTemplate(templateName, newScope);
        }

        return this.ExpandTemplate(exp, this.currentTarget().Scope);
    }

    private EvalMultiLineText(exp: string): string[] {

        exp = exp.substr(3, exp.length - 6);

        const templateRefValues: Map<string, string[]> = new Map<string, string[]>();
        const matches: string[] = exp.match(/@\{[^{}]+\}/g);
        if (matches !== null && matches !== undefined) {
            for (const match of matches) {
                const newExp: string = match.substr(1); // remove @
                templateRefValues.set(match, this.EvalExpression(newExp));
            }
        }

        let result: string[] = [exp];
        for (const templateRefValue of templateRefValues) {
            const tempRes: string[] = [];
            for (const res of result) {
                for (const refValue of templateRefValue[1]) {
                    tempRes.push(res.replace(/@\{[^{}]+\}/, refValue));
                }
            }
            result = tempRes;
        }

        return result;
    }

    private EvalByExpressionEngine(exp: string, scope: any) : any {
        const parse: Expression = new ExpressionEngine(this.GetMethodX.GetMethodX).parse(exp);

        return parse.tryEvaluate(scope);
    }

    private StringArrayConcat(array1: string[], array2: string[]): string[] {
        const result: string[] = [];
        for (const item1 of array1) {
            for (const item2 of array2) {
                result.push(item1.concat(item2));
            }
        }

        return result;
    }
}

export interface IGetMethod {
    GetMethodX(name: string): ExpressionEvaluator;
}

export class GetExpanderMethod implements IGetMethod {
    private readonly expander: Expander;

    public constructor(expander: Expander) {
        this.expander = expander;
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
                func in this.expander.TemplateMap) {
                const newScope: any = this.expander.ConstructScope(func, templateParameters);

                return this.expander.ExpandTemplate(func, newScope);
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
        if (!(templateName in this.expander.TemplateMap)) {
            throw new Error(`no such template '${templateName}' to call in ${expression}`);
        }

        const expectedArgsCount: number = this.expander.TemplateMap[templateName].Parameters.length;
        const actualArgsCount: number = expression.Children.length - 1;

        if (expectedArgsCount !== actualArgsCount) {
            throw new Error(`arguments mismatch for template ${templateName}, expect ${expectedArgsCount} actual ${actualArgsCount}`);
        }
    }

    public Join = (paramters: any[]): any => {
        if (paramters.length === 2 &&
            paramters[0] instanceof Array &&
            typeof (paramters[1]) === 'string') {
            const li: any = paramters[0].map((p: any) => p instanceof Array ? p[0] : p);
            const sep: string = paramters[1].concat(' ');

            return li.join(sep);
        }

        if (paramters.length === 3 &&
            paramters[0] instanceof Array &&
            typeof (paramters[1]) === 'string' &&
            typeof (paramters[2]) === 'string') {
            const li: any = paramters[0].map((p: any) => p instanceof Array ? p[0] : p);
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
}
