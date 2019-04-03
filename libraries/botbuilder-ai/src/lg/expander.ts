
import { AbstractParseTreeVisitor } from 'antlr4ts/tree';
import { ExpressionEngine } from 'botframework-expression';
import { TerminalNode } from 'botframework-expression/node_modules/antlr4ts/tree';
import { GetMethodExtensions } from './getExpandMethodExtensions';
import { GetValueExtensions } from './getExpandValueExtensions';
import * as lp from './lGFileParser';
import { LGFileParserVisitor } from './LGFileParserVisitor';
import { EvaluationContext } from './templateEngine';

export class EvaluationTarget {
    public TemplateName: string;
    public Scope: any;
    public constructor(templateName: string, scope: any) {
        this.TemplateName = templateName;
        this.Scope = scope;
    }
}

// tslint:disable-next-line: max-classes-per-file
export class Expander extends AbstractParseTreeVisitor<string[]> implements LGFileParserVisitor<string[]> {
    public readonly Context: EvaluationContext;
    private readonly evalutationTargetStack: EvaluationTarget[] = [];

    private readonly GetMethodX: GetMethodExtensions;

    private readonly GetValueX: GetValueExtensions;

    constructor(context: EvaluationContext) {
        super();
        this.Context = context;
        this.GetMethodX = new GetMethodExtensions(this);
        this.GetValueX = new GetValueExtensions(this);
    }

    public ExpandTemplate(templateName: string, scope: any): string[] {
        if (!this.Context.TemplateContexts.has(templateName)) {
            throw new Error(`No such template: ${templateName}`);
        }

        if (this.evalutationTargetStack[templateName] !== undefined) {
            throw new Error(`Loop deteced: ${this.evalutationTargetStack.reverse()
                .map((u: EvaluationTarget) => u.TemplateName)
                .join(' => ')}`);
        }

        this.evalutationTargetStack.push(new EvaluationTarget(templateName, scope));
        const result: string[] = this.visit(this.Context.TemplateContexts.get(templateName));
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
        const caseRules: lp.CaseRuleContext[] = ctx.conditionalTemplateBody()
                        .caseRule();
        for (const caseRule of caseRules) {
            const conditionExpression: string = caseRule.caseCondition()
                                        .EXPRESSION().text;
            if (this.EvalCondition(conditionExpression)) {
                return this.visit(caseRule.normalTemplateBody());
            }
        }

        if (ctx !== undefined && ctx.conditionalTemplateBody() !== undefined && ctx.conditionalTemplateBody().defaultRule() !== undefined) {
            return this.visit(ctx.conditionalTemplateBody()
                                .defaultRule()
                                .normalTemplateBody());
        } else {
            return undefined;
        }
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
                case lp.LGFileParser.INVALID_ESCAPE:
                    throw new Error(`escape character ${innerNode.text} is invalid`);
                case lp.LGFileParser.EXPRESSION: {
                    result = this.StringArrayConcat(result, [this.EvalExpression(innerNode.text)]);
                    break;
                }
                case lp.LGFileParser.TEMPLATE_REF: {
                    result = this.StringArrayConcat(result, this.EvalTemplateRef(innerNode.text));
                    break;
                }
                case lp.LGFileParser.MULTI_LINE_TEXT: {
                    result = this.StringArrayConcat(result, [this.EvalMultiLineText(innerNode.text)]);
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
        if (args.length === 1 &&
            !this.Context.TemplateParameters.has(templateName)) {
            return args[0];
        }
        const paramters: string[] = this.ExtractParamters(templateName);

        if (paramters.length !== args.length) {
            throw new Error(`Arguments count mismatch for template ref ${templateName},
            expected ${paramters.length}, actual ${args.length}`);
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

        if (Object.keys(validCharactersDict).includes(exp)) {
            return validCharactersDict[exp];
        }

        throw new Error(`escape character ${exp} is invalid`);
    }

    private EvalCondition(exp: string): boolean {
        try {
            exp = exp.replace(/(^{*)/g, '')
                .replace(/(}*$)/g, '');
            const result: any = this.EvalByExpressionEngine(exp, this.currentTarget().Scope);
            if ((typeof (result) === 'boolean' && !result) || (typeof (result) === 'number' && result === 0)) {
                return false;
            }

            return true;
        } catch (error) {
            console.log(error);

            return false;
        }
    }
    private EvalExpression(exp: string): string {
        const originStr: string = exp;
        exp = exp.replace(/(^{*)/g, '')
                .replace(/(}*$)/g, '');

        let result: string = this.EvalByExpressionEngine(exp, this.currentTarget().Scope);
        if (result === undefined) {
            result = originStr;
        }

        return result;
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
            const args: any[] = argExpressions.map((x: string) => this.EvalByExpressionEngine(x, this.currentTarget().Scope)[0]);
            const templateName: string = exp.substr(0, argsStartPos);

            const newScope: any = this.ConstructScope(templateName, args);

            return this.ExpandTemplate(templateName, newScope);
        }

        return this.ExpandTemplate(exp, this.currentTarget().Scope);
    }

    private EvalMultiLineText(exp: string): string {

        exp = exp.substr(3, exp.length - 6);

        return exp.replace(/@\{[^{}]+\}/g, (sub: string) => {
            const newExp: string = sub.substr(1); // remove @
            if (newExp.startsWith('{[') && newExp.endsWith(']}')) {
                const templateStrs: string[] = this.EvalTemplateRef(newExp.substr(2, newExp.length - 4)); // [ ]
                const randomNumber: number = Math.floor(Math.random() * templateStrs.length);

                return templateStrs[randomNumber];
            } else {
                return this.EvalExpression(newExp); // { }
            }
        });
    }

    private ExtractParamters(templateName: string): string[] {
        const result: string[] = [];
        const parameters: any = this.Context.TemplateParameters.get(templateName);
        if (parameters === undefined || !(parameters instanceof Array)) {
            return result;
        }

        return parameters;
    }

    private EvalByExpressionEngine(exp: string, scope: any) : any {
        return ExpressionEngine.EvaluateWithString(exp, scope, this.GetValueX.GetValueX, this.GetMethodX.GetMethodX);
    }

    private StringArrayConcat(array1: string[], array2: string[]): string[] {
        let result: string[] = [];
        for (const item1 of array1) {
            for (const item2 of array2) {
                result.push(item1.concat(item2));
            }
        }

        return result;
    }
}
