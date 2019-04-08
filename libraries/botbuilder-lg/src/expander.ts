
import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import { Expression } from 'botbuilder-expression';
import { ExpressionEngine} from 'botbuilder-expression-parser';
import { EvaluationTarget } from './evaluator';
import { GetExpanderMethod, IGetMethod } from './expanderMethodExtensions';
import * as lp from './generated/LGFileParser';
import { LGFileParserVisitor } from './generated/LGFileParserVisitor';
import { EvaluationContext } from './templateEngine';

// tslint:disable-next-line: max-classes-per-file
export class Expander extends AbstractParseTreeVisitor<string[]> implements LGFileParserVisitor<string[]> {
    public readonly Context: EvaluationContext;
    private readonly evalutationTargetStack: EvaluationTarget[] = [];

    private readonly GetMethodX: IGetMethod;

    constructor(context: EvaluationContext, getMethod: IGetMethod) {
        super();
        this.Context = context;
        this.GetMethodX = getMethod === undefined ? new GetExpanderMethod(this) : getMethod;
    }

    public ExpandTemplate(templateName: string, scope: any): string[] {
        if (!this.Context.TemplateContexts.has(templateName)) {
            throw new Error(`No such template: ${templateName}`);
        }

        if (this.evalutationTargetStack.find((u: EvaluationTarget) => u.TemplateName === templateName) !== undefined) {
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
                    result = this.StringArrayConcat(result, [this.EvalExpression(innerNode.text)]);
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
        if (args.length === 1 &&
            !this.Context.TemplateParameters.has(templateName)) {
            return args[0];
        }
        const paramters: string[] = this.ExtractParamters(templateName);
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

    private EvalExpression(exp: string): string {
        exp = exp.replace(/(^{*)/g, '')
            .replace(/(}*$)/g, '');

        const { value: result, error }: { value: any; error: string } = this.EvalByExpressionEngine(exp, this.currentTarget().Scope);
        if (error !== undefined) {
            throw new Error(`Error occurs when evaluating expression ${exp}: ${error}`);
        }
        if (result === undefined) {
            throw new Error(`Error occurs when evaluating expression '${exp}': ${exp} is evaluated to null`);
        }

        return String(result);
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

        exp = exp.substr(3, exp.length - 6);
        exp = exp.replace(/@\{[^{}]+\}/g, (subStr: string) => {
            const newExp: string = subStr.substr(1); // remove @
            if (newExp.startsWith('{') && newExp.endsWith('}')) {
                return this.EvalExpression(newExp).replace('\"', '\'');
            }
        });

        const templateRefValues: Map<string, string[]> = new Map<string, string[]>();
        const matches: string[] = exp.match(/@\{[^{}]+\}/g);
        if (matches !== null && matches !== undefined) {
            for (const match of matches) {
                const newExp: string = match.substr(1); // remove @
                templateRefValues.set(match, this.EvalTemplateRef(newExp.substr(2, newExp.length - 4))); // [ ]
            }
        }

        let result: string[] = [exp];
        for (const templateRefValue of templateRefValues) {
            let tempRes: string[] = [];
            for (const res of result) {
                for (const refValue of templateRefValue[1]) {
                    tempRes.push(res.replace(/@\{[^{}]+\}/, refValue.replace('\"', '\'')));
                }
            }
            result = tempRes;
        }

        return result;
    }

    private ExtractParamters(templateName: string): string[] {
        const parameters: string[] = this.Context.TemplateParameters.get(templateName);

        return parameters === undefined ? [] : parameters;
    }

    private EvalByExpressionEngine(exp: string, scope: any) : any {
        const parse: Expression = new ExpressionEngine(this.GetMethodX.GetMethodX).Parse(exp);

        return parse.TryEvaluate(scope);
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
