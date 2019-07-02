
/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line: no-submodule-imports
import { AbstractParseTreeVisitor, ParseTree, TerminalNode } from 'antlr4ts/tree';
import { Constant, Expression, Extensions, IExpressionParser } from 'botbuilder-expression';
import { ExpressionEngine} from 'botbuilder-expression-parser';
import { flatten, keyBy } from 'lodash';
import { EvaluationTarget, Evaluator } from './evaluator';
import * as lp from './generated/LGFileParser';
import { LGFileParserVisitor } from './generated/LGFileParserVisitor';
import { GetMethodExtensions } from './getMethodExtensions';
import { LGTemplate } from './lgTemplate';

export class AnalyzerResult {
    public Variables: string[];
    public TemplateReferences: string[];

    public constructor(variables: string[] = [], templateRefNames: string[] = []) {
        this.Variables = Array.from(new Set(variables));
        this.TemplateReferences = Array.from(new Set(templateRefNames));
    }

    public union(outputItem: AnalyzerResult): this {
        this.Variables = Array.from(new Set(this.Variables.concat(outputItem.Variables)));
        this.TemplateReferences = Array.from(new Set(this.TemplateReferences.concat(outputItem.TemplateReferences)));

        return this;
    }
}

// tslint:disable-next-line: max-classes-per-file
/**
 * Analyzer engine. To analyse which variable may be used
 */
export class Analyzer extends AbstractParseTreeVisitor<AnalyzerResult> implements LGFileParserVisitor<AnalyzerResult> {
    public readonly Templates: LGTemplate[];
    public readonly TemplateMap: {[name: string]: LGTemplate};
    private readonly evalutationTargetStack: EvaluationTarget[] = [];
    private readonly _expressionParser: IExpressionParser;

    constructor(templates: LGTemplate[]) {
        super();
        this.Templates = templates;
        this.TemplateMap = keyBy(templates, (t: LGTemplate) => t.Name);
        this._expressionParser = new ExpressionEngine(new GetMethodExtensions(new Evaluator(this.Templates, undefined)).GetMethodX);
    }

    public AnalyzeTemplate(templateName: string): AnalyzerResult {
        if (!(templateName in this.TemplateMap)) {
            throw new Error(`No such template: ${templateName}`);
        }

        if (this.evalutationTargetStack.find((u: EvaluationTarget) => u.TemplateName === templateName) !== undefined) {
            throw new Error(`Loop deteced: ${this.evalutationTargetStack.reverse()
                .map((u: EvaluationTarget) => u.TemplateName)
                .join(' => ')}`);
        }

        // Using a stack to track the evalution trace
        this.evalutationTargetStack.push(new EvaluationTarget(templateName, undefined));

        // we don't exclude paratemters any more
        // because given we don't track down for templates have parameters
        // the only scenario that we are still analyzing an parameterized template is
        // this template is root template to anaylze, in this we also don't have exclude parameters
        const dependencies: AnalyzerResult = this.visit(this.TemplateMap[templateName].ParseTree);
        this.evalutationTargetStack.pop();

        return dependencies;
    }

    public visitTemplateDefinition(ctx: lp.TemplateDefinitionContext): AnalyzerResult {
        const templateNameContext: lp.TemplateNameLineContext = ctx.templateNameLine();
        if (templateNameContext.templateName().text === this.currentTarget().TemplateName) {
            if (ctx.templateBody() !== undefined) {
                return this.visit(ctx.templateBody());
            }
        }

        throw Error(`template name match failed`);
    }

    public visitNormalBody(ctx: lp.NormalBodyContext): AnalyzerResult {
        return this.visit(ctx.normalTemplateBody());
    }

    public visitNormalTemplateBody(ctx: lp.NormalTemplateBodyContext) : AnalyzerResult {
        const result: AnalyzerResult = new AnalyzerResult();
        for (const templateStr of ctx.normalTemplateString()) {
            result.union(this.visit(templateStr));
        }

        return result;
    }

    public visitIfElseBody(ctx: lp.IfElseBodyContext): AnalyzerResult {
        const result: AnalyzerResult = new AnalyzerResult();

        const ifRules: lp.IfConditionRuleContext[] = ctx.ifElseTemplateBody().ifConditionRule();
        for (const ifRule of ifRules) {
            const expressions: TerminalNode[] = ifRule.ifCondition().EXPRESSION();
            if (expressions !== undefined && expressions.length > 0) {
                result.union(this.AnalyzeExpression(expressions[0].text));
            }
            if (ifRule.normalTemplateBody() !== undefined) {
                result.union(this.visit(ifRule.normalTemplateBody()));
            }
        }

        return result;
    }

    public visitSwitchCaseBody(ctx: lp.SwitchCaseBodyContext): AnalyzerResult {
        const result: AnalyzerResult = new AnalyzerResult();
        const switchCaseNodes: lp.SwitchCaseRuleContext[] = ctx.switchCaseTemplateBody().switchCaseRule();
        for (const iterNode of switchCaseNodes) {
            const expressions: TerminalNode[] = iterNode.switchCaseStat().EXPRESSION();
            if (expressions.length > 0) {
                result.union(this.AnalyzeExpression(expressions[0].text));
            }
            if (iterNode.normalTemplateBody() !== undefined) {
                result.union(this.visit(iterNode.normalTemplateBody()));
            }
        }

        return result;
    }

    public visitNormalTemplateString(ctx: lp.NormalTemplateStringContext): AnalyzerResult {
        const result: AnalyzerResult = new AnalyzerResult();
        for (const node of ctx.children) {
            const innerNode: TerminalNode =  node as TerminalNode;
            switch (innerNode.symbol.type) {
                case lp.LGFileParser.DASH: break;
                case lp.LGFileParser.EXPRESSION: {
                    result.union(this.AnalyzeExpression(innerNode.text));
                    break;
                }
                case lp.LGFileParser.TEMPLATE_REF: {
                    result.union(this.AnalyzeTemplateRef(innerNode.text));
                    break;
                }
                case lp.LGFileParser.MULTI_LINE_TEXT: {
                    result.union(this.AnalyzeMultiLineText(innerNode.text));
                    break;
                }
                default: {
                    break;
                }
            }
        }

        return result;
    }

    protected defaultResult(): AnalyzerResult {
        return new AnalyzerResult();
    }

    private AnalyzeExpressionDirectly(exp: Expression): AnalyzerResult {
        const result: AnalyzerResult =  new AnalyzerResult();
        if (exp.Type === 'lgTemplate') {
            const templateName: string = (exp.Children[0] as Constant).Value;
            result.union(new AnalyzerResult([], [templateName]));

            if (exp.Children.length === 1) {
                result.union(this.AnalyzeTemplate((exp.Children[0] as Constant).Value));
            } else {
                // only get template ref names
                const templaterefNames: string[] = this.AnalyzeTemplate((exp.Children[0] as Constant).Value).TemplateReferences;
                result.union(new AnalyzerResult([], templaterefNames));

                // analyzer other children
                exp.Children.forEach((e: Expression) => result.union(this.AnalyzeExpressionDirectly(e)));
            }
        } else {
            // analyzer all children
            exp.Children.forEach((e: Expression) => result.union(this.AnalyzeExpressionDirectly(e)));
        }

        return result;
    }

    private AnalyzeExpression(exp: string): AnalyzerResult {
        const result: AnalyzerResult =  new AnalyzerResult();
        exp = exp.replace(/(^@*)/g, '')
                .replace(/(^{*)/g, '')
                .replace(/(}*$)/g, '');
        const parsed: Expression = this._expressionParser.parse(exp);

        const references: ReadonlyArray<string> = Extensions.References(parsed);
        result.union(new AnalyzerResult(references.slice(), []));
        result.union(this.AnalyzeExpressionDirectly(parsed));

        return  result;
    }

    private AnalyzeTemplateRef(exp: string): AnalyzerResult {
        const result: AnalyzerResult = new AnalyzerResult();
        exp = exp.replace(/(^\[*)/g, '')
                .replace(/(\]*$)/g, '');
        const argsStartPos: number = exp.indexOf('(');
        if (argsStartPos > 0) { // Do have args

            // evaluate all arguments using ExpressoinEngine
            const argsEndPos: number = exp.lastIndexOf(')');

            if (argsEndPos < 0 || argsEndPos < argsStartPos + 1) {
                throw Error(`Not a valid template ref: ${exp}`);
            }

            const args: string[] = exp.substr(argsStartPos + 1, argsEndPos - argsStartPos - 1).split(',');

            // Before we have a matural solution to analyze parameterized template, we stop digging into
            // templates with parameters, we just analyze it's args.
            // With this approach we may not get a very fine-grained result
            // but the result will still be accurate

            const templateAnalyzerResult: AnalyzerResult[] = args.map((arg: string) => this.AnalyzeExpression(arg));
            const templateName: string = exp.substr(0, argsStartPos);

            // add this template
            result.union(new AnalyzerResult([], [templateName]));
            templateAnalyzerResult.forEach((e: AnalyzerResult) => result.union(e));
        } else {
            result.union(new AnalyzerResult([], [exp]));

            // We analyze tempalte only if the template has no formal parameters
            // But we should analyzer template reference names for all situation
            if (this.TemplateMap[exp].Parameters === undefined || this.TemplateMap[exp].Parameters.length === 0) {
                result.union(this.AnalyzeTemplate(exp));
            } else {
                result.union(new AnalyzerResult([], this.AnalyzeTemplate(exp).TemplateReferences));
            }
        }

        return result;
    }

    private AnalyzeMultiLineText(exp: string): AnalyzerResult {
        const result: AnalyzerResult =  new AnalyzerResult();
        exp = exp.substr(3, exp.length - 6);
        const matches: string[] = exp.match(/@\{[^{}]+\}/g);
        for (const match of matches) {
            result.union(this.AnalyzeExpression(match));
        }

        return result;
    }

    private currentTarget(): EvaluationTarget {
        return this.evalutationTargetStack[this.evalutationTargetStack.length - 1];
    }
}
