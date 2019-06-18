
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

export class AnalyzerOutputItem {
    public Variables: string[];
    public TemplateRefNames: string[];

    public constructor(variables: string[] = [], templateRefNames: string[] = []) {
        this.Variables = Array.from(new Set(variables));
        this.TemplateRefNames = Array.from(new Set(templateRefNames));
    }

    public append(outputItem: AnalyzerOutputItem): this {
        this.Variables = Array.from(new Set(this.Variables.concat(outputItem.Variables)));
        this.TemplateRefNames = Array.from(new Set(this.TemplateRefNames.concat(outputItem.TemplateRefNames)));

        return this;
    }
}

// tslint:disable-next-line: max-classes-per-file
/**
 * Analyzer engine. To analyse which variable may be used
 */
export class Analyzer extends AbstractParseTreeVisitor<AnalyzerOutputItem> implements LGFileParserVisitor<AnalyzerOutputItem> {
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

    public AnalyzeTemplate(templateName: string): AnalyzerOutputItem {
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
        // because given we don't track down for templates have paramters
        // the only scenario that we are still analyzing an paramterized template is
        // this template is root template to anaylze, in this we also don't have exclude paramters
        const dependencies: AnalyzerOutputItem = this.visit(this.TemplateMap[templateName].ParseTree);
        this.evalutationTargetStack.pop();

        return dependencies;
    }

    public visitTemplateDefinition(ctx: lp.TemplateDefinitionContext): AnalyzerOutputItem {
        const templateNameContext: lp.TemplateNameLineContext = ctx.templateNameLine();
        if (templateNameContext.templateName().text === this.currentTarget().TemplateName) {
            if (ctx.templateBody() !== undefined) {
                return this.visit(ctx.templateBody());
            }
        }

        throw Error(`template name match failed`);
    }

    public visitNormalBody(ctx: lp.NormalBodyContext): AnalyzerOutputItem {
        return this.visit(ctx.normalTemplateBody());
    }

    public visitNormalTemplateBody(ctx: lp.NormalTemplateBodyContext) : AnalyzerOutputItem {
        const result: AnalyzerOutputItem = new AnalyzerOutputItem();
        for (const templateStr of ctx.normalTemplateString()) {
            result.append(this.visit(templateStr));
        }

        return result;
    }

    public visitIfElseBody(ctx: lp.IfElseBodyContext): AnalyzerOutputItem {
        const result: AnalyzerOutputItem = new AnalyzerOutputItem();

        const ifRules: lp.IfConditionRuleContext[] = ctx.ifElseTemplateBody().ifConditionRule();
        for (const ifRule of ifRules) {
            const expressions: TerminalNode[] = ifRule.ifCondition().EXPRESSION();
            if (expressions !== undefined && expressions.length > 0) {
                result.append(this.AnalyzeExpression(expressions[0].text));
            }
            if (ifRule.normalTemplateBody() !== undefined) {
                result.append(this.visit(ifRule.normalTemplateBody()));
            }
        }

        return result;
    }

    public visitSwitchCaseBody(ctx: lp.SwitchCaseBodyContext): AnalyzerOutputItem {
        const result: AnalyzerOutputItem = new AnalyzerOutputItem();
        const switchCaseNodes: lp.SwitchCaseRuleContext[] = ctx.switchCaseTemplateBody().switchCaseRule();
        for (const iterNode of switchCaseNodes) {
            const expressions: TerminalNode[] = iterNode.switchCaseStat().EXPRESSION();
            if (expressions.length > 0) {
                result.append(this.AnalyzeExpression(expressions[0].text));
            }
            if (iterNode.normalTemplateBody() !== undefined) {
                result.append(this.visit(iterNode.normalTemplateBody()));
            }
        }

        return result;
    }

    public visitNormalTemplateString(ctx: lp.NormalTemplateStringContext): AnalyzerOutputItem {
        const result: AnalyzerOutputItem = new AnalyzerOutputItem();
        for (const node of ctx.children) {
            const innerNode: TerminalNode =  node as TerminalNode;
            switch (innerNode.symbol.type) {
                case lp.LGFileParser.DASH: break;
                case lp.LGFileParser.EXPRESSION: {
                    result.append(this.AnalyzeExpression(innerNode.text));
                    break;
                }
                case lp.LGFileParser.TEMPLATE_REF: {
                    result.append(this.AnalyzeTemplateRef(innerNode.text));
                    break;
                }
                case lp.LGFileParser.MULTI_LINE_TEXT: {
                    result.append(this.AnalyzeMultiLineText(innerNode.text));
                    break;
                }
                default: {
                    break;
                }
            }
        }

        return result;
    }

    protected defaultResult(): AnalyzerOutputItem {
        return new AnalyzerOutputItem();
    }

    private AnalyzerExpressionDirectly(exp: Expression): AnalyzerOutputItem {
        const result: AnalyzerOutputItem =  new AnalyzerOutputItem();
        if (exp.Type === 'lgTemplate') {
            const templateName: string = (exp.Children[0] as Constant).Value;
            result.append(new AnalyzerOutputItem([], [templateName]));

            if (exp.Children.length === 1) {
                result.append(this.AnalyzeTemplate((exp.Children[0] as Constant).Value));
            } else {
                // only get template ref name
                const templaterefNames: string[] = this.AnalyzeTemplate((exp.Children[0] as Constant).Value).TemplateRefNames;
                result.append(new AnalyzerOutputItem([], templaterefNames));

                // analyzer other children
                exp.Children.forEach((e: Expression) => result.append(this.AnalyzerExpressionDirectly(e)));
            }
        } else {
            // analyzer all children
            exp.Children.forEach((e: Expression) => result.append(this.AnalyzerExpressionDirectly(e)));
        }

        return result;
    }

    private AnalyzeExpression(exp: string): AnalyzerOutputItem {
        const result: AnalyzerOutputItem =  new AnalyzerOutputItem();
        exp = exp.replace(/(^@*)/g, '')
                .replace(/(^{*)/g, '')
                .replace(/(}*$)/g, '');
        const parsed: Expression = this._expressionParser.parse(exp);

        const references: ReadonlyArray<string> = Extensions.References(parsed);
        result.append(new AnalyzerOutputItem(references.slice(), []));
        result.append(this.AnalyzerExpressionDirectly(parsed));

        return  result;
    }

    private AnalyzeTemplateRef(exp: string): AnalyzerOutputItem {
        const result: AnalyzerOutputItem = new AnalyzerOutputItem();
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

            // Before we have a matural solution to analyze paramterized template, we stop digging into
            // templates with paramters, we just analyze it's args.
            // With this approach we may not get a very fine-grained result
            // but the result will still be accurate

            const templateAnalyzerResult: AnalyzerOutputItem[] = args.map((arg: string) => this.AnalyzeExpression(arg));
            const templateName: string = exp.substr(0, argsStartPos);

            // add this template
            result.append(new AnalyzerOutputItem([], [templateName]));
            templateAnalyzerResult.forEach((e: AnalyzerOutputItem) => result.append(e));
        } else {
            result.append(new AnalyzerOutputItem([], [exp]));

            // We analyze tempalte only if the template has no formal parameters
            // But we should analyzer template reference names for all situation
            if (this.TemplateMap[exp].Parameters === undefined || this.TemplateMap[exp].Parameters.length === 0) {
                result.append(this.AnalyzeTemplate(exp));
            } else {
                result.append(new AnalyzerOutputItem([], this.AnalyzeTemplate(exp).TemplateRefNames));
            }
        }

        return result;
    }

    private AnalyzeMultiLineText(exp: string): AnalyzerOutputItem {
        const result: AnalyzerOutputItem =  new AnalyzerOutputItem();
        exp = exp.substr(3, exp.length - 6);
        const matches: string[] = exp.match(/@\{[^{}]+\}/g);
        for (const match of matches) {
            result.append(this.AnalyzeExpression(match));
        }

        return result;
    }

    private currentTarget(): EvaluationTarget {
        return this.evalutationTargetStack[this.evalutationTargetStack.length - 1];
    }
}
