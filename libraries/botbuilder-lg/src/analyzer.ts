import { AbstractParseTreeVisitor, ParseTree, TerminalNode } from 'antlr4ts/tree';
import { Constant, Extensions, IExpressionParser } from 'botbuilder-expression';
import { ExpressionEngine} from 'botbuilder-expression-parser';
import { EvaluationTarget } from './evaluator';
import * as lp from './generator/LGFileParser';
import { LGFileParserVisitor } from './generator/LGFileParserVisitor';
import { GetMethodExtensions } from './getMethodExtensions';
import { EvaluationContext } from './templateEngine';

// tslint:disable-next-line: max-classes-per-file
export class Analyzer extends AbstractParseTreeVisitor<string[]> implements LGFileParserVisitor<string[]> {
    public readonly Context: EvaluationContext;
    private readonly evalutationTargetStack: EvaluationTarget[] = [];
    private readonly _expressionParser: IExpressionParser;

    constructor(context: EvaluationContext) {
        super();
        this.Context = context;
        this._expressionParser = new ExpressionEngine(new GetMethodExtensions(undefined).GetMethodX);
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

    public visitConditionalBody(ctx: lp.ConditionalBodyContext): string[] {
        let result: string[] = [];

        const ifRules: lp.IfConditionRuleContext[] = ctx.conditionalTemplateBody().ifConditionRule();
        for (const ifRule of ifRules) {

            const expression: TerminalNode = ifRule.ifCondition().EXPRESSION(0);
            if (expression !== undefined) {
                result = result.concat(this.AnalyzeExpression(expression.text));
            }

            result = result.concat(this.visit(ifRule.normalTemplateBody()));
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
        const parse = this._expressionParser.Parse(exp);
        let references = new Set<string>();

        const path = Extensions.ReferenceWalk(parse, references, (expression) => {
            let found = false;
            if (expression instanceof Constant && typeof (expression as Constant).Value === 'string') {
                const str: string = (expression as Constant).Value;
                if (str.startsWith('[') && str.endsWith(']')) {
                    found = true;
                    let end = str.indexOf('(');
                    if (end === -1) {
                        end = str.length - 1;
                    }

                    const template = str.substr(1, end - 1);
                    const analyzer = new Analyzer(this.Context);
                    for (const reference of analyzer.AnalyzeTemplate(template)) {
                        references.add(reference);
                    }
                } else if (str.startsWith('{') && str.endsWith('}')) {
                    found = true;
                    for (const childRef of this.AnalyzeExpression(str)) {
                        references.add(childRef);
                    }
                }
            }

            return found;
        });

        if (path !== undefined) {
            references.add(path);
        }

        return Array.from(references);
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
