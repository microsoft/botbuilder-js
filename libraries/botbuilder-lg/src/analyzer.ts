import { AbstractParseTreeVisitor, ParseTree } from 'antlr4ts/tree';
import { TerminalNode } from 'botframework-expression//node_modules/antlr4ts/tree';
import { ExpressionEngine } from 'botframework-expression';
import { EvaluationTarget } from './evaluator';
import { ExpressionAnalyzerVisitor } from './expressionAnalyzerVisitor';
import * as lp from './lGFileParser';
import { LGFileParserVisitor } from './LGFileParserVisitor';
import { EvaluationContext } from './templateEngine';

// tslint:disable-next-line: max-classes-per-file
export class Analyzer extends AbstractParseTreeVisitor<string[]> implements LGFileParserVisitor<string[]> {
    public readonly Context: EvaluationContext;
    private readonly evalutationTargetStack: EvaluationTarget[] = [];

    constructor(context: EvaluationContext) {
        super();
        this.Context = context;
    }

    public AnalyzeTemplate(templateName: string): string[] {
        if (!this.Context.TemplateContexts.has(templateName)) {
            throw new Error(`No such template: ${templateName}`);
        }

        if (this.evalutationTargetStack[templateName] !== undefined) {
            throw new Error(`Loop deteced: ${this.evalutationTargetStack.reverse()
                .map((u: EvaluationTarget) => u.TemplateName)
                .join(' => ')}`);
        }

        this.evalutationTargetStack.push(new EvaluationTarget(templateName, undefined));
        const rawDependencies: string[] = this.visit(this.Context.TemplateContexts.get(templateName));
        const parameters: string[] = this.ExtractParamters(templateName);
        const dependencies = Array.from(new Set(rawDependencies.filter((element) => !parameters.includes(element))));
        this.evalutationTargetStack.pop();

        return dependencies;
    }

    public visitTemplateDefinition(ctx: lp.TemplateDefinitionContext): string[] {
        const templateNameContext: lp.TemplateNameLineContext = ctx.templateNameLine();
        if (templateNameContext.templateName().text === this.currentTarget().TemplateName) {
            return this.visit(ctx.templateBody());
        }

        throw Error(`template name match failed`);
    }

    public visitNormalBody(ctx: lp.NormalBodyContext): string[] {
        return this.visit(ctx.normalTemplateBody());
    }

    public visitNormalTemplateBody(ctx: lp.NormalTemplateBodyContext) : string[] {
        let result: string[] = [];
        for (const templateStr of ctx.normalTemplateString()) {
            result = result.concat(this.visit(templateStr));
        }

        return result;
    }

    public visitConditionalBody(ctx: lp.ConditionalBodyContext) : string[] {
        let result: string[] = [];

        const caseRules: lp.CaseRuleContext[] = ctx.conditionalTemplateBody().caseRule();
        for (const caseRule of caseRules) {
            const conditionExpression: string = caseRule.caseCondition()
                                        .EXPRESSION().text;
            const childConditionResult: string[] = this.AnalyzeExpression(conditionExpression);
            result = result.concat(childConditionResult);

            const childTemplateBodyResult: string[] = this.visit(caseRule.normalTemplateBody());
            result = result.concat(childTemplateBodyResult);
        }

        if (ctx.conditionalTemplateBody() !== undefined && ctx.conditionalTemplateBody().defaultRule() !== undefined) {
            const childDefaultRuleResult: string[] = this.visit(ctx.conditionalTemplateBody().defaultRule().normalTemplateBody());
            result = result.concat(childDefaultRuleResult);
        }

        return result;
    }

    public visitNormalTemplateString(ctx: lp.NormalTemplateStringContext): string[] {
        let result: string[] = [];
        for (const node of ctx.children) {
            const innerNode: TerminalNode =  node as TerminalNode;
            switch (innerNode.symbol.type) {
                case lp.LGFileParser.DASH: break;
                case lp.LGFileParser.EXPRESSION: {
                    result = result.concat(this.AnalyzeExpression(innerNode.text));
                    break;
                }
                case lp.LGFileParser.TEMPLATE_REF: {
                    result = result.concat(this.AnalyzeTemplateRef(innerNode.text));
                    break;
                }
                case lp.LGFileParser.MULTI_LINE_TEXT: {
                    result = result.concat(this.AnalyzeMultiLineText(innerNode.text));
                    break;
                }
                default: {
                    break;
                }
            }
        }

        return result;
    }

    protected defaultResult(): string[] {
        return [];
    }

    private AnalyzeExpression(exp: string): string[] {
        exp = exp.replace(/(^{*)/g, '')
                .replace(/(}*$)/g, '');
        const parseTree: ParseTree = ExpressionEngine.Parse(exp);

        return this.AnalyzeParserTree(parseTree);
    }

    private AnalyzeParserTree(parserTree: ParseTree): string[] {
        let result: string[] = [];
        const visitor = new ExpressionAnalyzerVisitor(this.Context);

        return visitor.Analyzer(parserTree);
    }

    private AnalyzeTemplateRef(exp: string): string[] {
        exp = exp.replace(/(^\[*)/g, '')
                .replace(/(\]*$)/g, '');
        const argsStartPos: number = exp.indexOf('(');
        if (argsStartPos > 0) {
            const argsEndPos: number = exp.lastIndexOf(')');
            if (argsEndPos < 0 || argsEndPos < argsStartPos + 1) {
                throw Error(`Not a valid template ref: ${exp}`);
            }

            const templateName: string = exp.substr(0, argsStartPos);

            return this.AnalyzeTemplate(templateName);
        } else {
            return this.AnalyzeTemplate(exp);
        }
    }

    private AnalyzeMultiLineText(exp: string): string[] {
        let result: string[] = [];
        exp = exp.substr(3, exp.length - 6);
        const matches: string[] = exp.match(/@\{[^{}]+\}/g);
        for (const match of matches) {
            const newExp: string = match.substr(1); // remove @
            if (newExp.startsWith('{[') && newExp.endsWith(']}')) {
                result = result.concat(this.AnalyzeTemplateRef(newExp.substr(2, newExp.length - 4)));
            } else {
                result = result.concat(this.AnalyzeExpression(newExp));
            }
        }

        return result;
    }

    private currentTarget(): EvaluationTarget {
        return this.evalutationTargetStack[this.evalutationTargetStack.length - 1];
    }

    private ExtractParamters(templateName: string): string[] {
        const result: string[] = [];
        const parameters: any = this.Context.TemplateParameters.get(templateName);
        if (parameters === undefined || !(parameters instanceof Array)) {
            return result;
        }

        return parameters;
    }
}
