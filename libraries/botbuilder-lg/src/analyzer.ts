
/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line: no-submodule-imports
import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import { Expression, ExpressionEngine, ExpressionParserInterface, Extensions } from 'botframework-expressions';
import { keyBy } from 'lodash';
import { EvaluationTarget } from './evaluationTarget';
import { Evaluator } from './evaluator';
import * as lp from './generated/LGFileParser';
import { LGFileParserVisitor } from './generated/LGFileParserVisitor';
import { LGTemplate } from './lgTemplate';

// tslint:disable-next-line: completed-docs
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
    public readonly templates: LGTemplate[];
    public readonly templateMap: {[name: string]: LGTemplate};
    private readonly evalutationTargetStack: EvaluationTarget[] = [];
    private readonly _expressionParser: ExpressionParserInterface;

    public constructor(templates: LGTemplate[], expressionEngine: ExpressionEngine) {
        super();
        this.templates = templates;
        this.templateMap = keyBy(templates, (t: LGTemplate): string => t.name);

        // create an evaluator to leverage it's customized function look up for checking
        const evaluator: Evaluator = new Evaluator(this.templates, expressionEngine);
        this._expressionParser = evaluator.expressionEngine;
    }

    public analyzeTemplate(templateName: string): AnalyzerResult {
        if (!(templateName in this.templateMap)) {
            throw new Error(`No such template: ${ templateName }`);
        }

        if (this.evalutationTargetStack.find((u: EvaluationTarget): boolean => u.templateName === templateName) !== undefined) {
            throw new Error(`Loop deteced: ${ this.evalutationTargetStack.reverse()
                .map((u: EvaluationTarget): string => u.templateName)
                .join(' => ') }`);
        }

        // Using a stack to track the evalution trace
        this.evalutationTargetStack.push(new EvaluationTarget(templateName, undefined));

        // we don't exclude paratemters any more
        // because given we don't track down for templates have parameters
        // the only scenario that we are still analyzing an parameterized template is
        // this template is root template to anaylze, in this we also don't have exclude parameters
        const dependencies: AnalyzerResult = this.visit(this.templateMap[templateName].parseTree);
        this.evalutationTargetStack.pop();

        return dependencies;
    }

    public visitTemplateDefinition(ctx: lp.TemplateDefinitionContext): AnalyzerResult {
        const templateNameContext: lp.TemplateNameLineContext = ctx.templateNameLine();
        if (templateNameContext.templateName().text === this.currentTarget().templateName) {
            if (ctx.templateBody() !== undefined) {
                return this.visit(ctx.templateBody());
            }
        }

        throw Error(`template name match failed`);
    }

    public visitNormalBody(ctx: lp.NormalBodyContext): AnalyzerResult {
        return this.visit(ctx.normalTemplateBody());
    }

    public visitNormalTemplateBody(ctx: lp.NormalTemplateBodyContext): AnalyzerResult {
        const result: AnalyzerResult = new AnalyzerResult();
        for (const templateStr of ctx.templateString()) {
            result.union(this.visit(templateStr.normalTemplateString()));
        }

        return result;
    }

    public visitStructuredTemplateBody(ctx: lp.StructuredTemplateBodyContext): AnalyzerResult {
        const result: AnalyzerResult = new AnalyzerResult();

        const bodys: TerminalNode[] = ctx.structuredBodyContentLine().STRUCTURED_CONTENT();
        for (const body  of bodys) {
            const line: string = body.text.trim();
            if (line === '') {
                continue;
            }
            const start: number = line.indexOf('=');
            if (start > 0) {
                // make it insensitive
                const property: string = line.substr(0, start).trim().toLowerCase();
                const originValue: string = line.substr(start + 1).trim();
                const valueArray: string[] = Evaluator.wrappedRegExSplit(originValue, Evaluator.escapeSeperatorReverseRegex);
                if (valueArray.length === 1) {
                    result.union(this.analyzeText(originValue));
                } else {
                    const valueList: any[] = [];
                    for (const item of valueArray) {
                        result.union(this.analyzeText(item.trim()));
                    }

                    result[property] = valueList;
                }
            } else if (this.isPureExpression(line)) {
                result.union(this.analyzeExpression(line));
            }
        }

        return result;
    }

    public visitIfElseBody(ctx: lp.IfElseBodyContext): AnalyzerResult {
        const result: AnalyzerResult = new AnalyzerResult();

        const ifRules: lp.IfConditionRuleContext[] = ctx.ifElseTemplateBody().ifConditionRule();
        for (const ifRule of ifRules) {
            const expressions: TerminalNode[] = ifRule.ifCondition().EXPRESSION();
            if (expressions !== undefined && expressions.length > 0) {
                result.union(this.analyzeExpression(expressions[0].text));
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
                result.union(this.analyzeExpression(expressions[0].text));
            }
            if (iterNode.normalTemplateBody()) {
                result.union(this.visit(iterNode.normalTemplateBody()));
            }
        }

        return result;
    }

    public visitNormalTemplateString(ctx: lp.NormalTemplateStringContext): AnalyzerResult {
        const result: AnalyzerResult = new AnalyzerResult();
        
        for (const expression of ctx.EXPRESSION()) {
            result.union(this.analyzeExpression(expression.text));
        }

        return result;
    }

    protected defaultResult(): AnalyzerResult {
        return new AnalyzerResult();
    }

    private analyzeExpressionDirectly(exp: Expression): AnalyzerResult {
        const result: AnalyzerResult =  new AnalyzerResult();

        if (exp.type in this.templateMap) {
            const templateName: string = exp.type;
            result.union(new AnalyzerResult([], [templateName]));

            if (this.templateMap[templateName].parameters === undefined || this.templateMap[templateName].parameters.length === 0) {
                result.union(this.analyzeTemplate(templateName));
            } else {
                // if template has params, just get the templateref without variables.
                result.union(new AnalyzerResult([], this.analyzeTemplate(templateName).TemplateReferences));
            }
        }

        if (exp.children !== undefined) {
            exp.children.forEach((e: Expression): AnalyzerResult => result.union(this.analyzeExpressionDirectly(e)));
        }

        return result;
    }

    private analyzeText(exp: string): AnalyzerResult {
        if (exp === undefined || exp.length === 0) {
            return new AnalyzerResult();
        }

        if (this.isPureExpression(exp)) {
            return this.analyzeExpression(exp);
        } else {
            // unescape \|
            return this.analyzeTextContainsExpression(exp);
        }
    }

    private analyzeTextContainsExpression(exp: string): AnalyzerResult {
        const result: AnalyzerResult =  new AnalyzerResult();
        const reversedExps: RegExpMatchArray = exp.split('').reverse().join('').match(Evaluator.expressionRecognizeReverseRegex);
        const expressionsRaw: string[] = reversedExps.map((e: string): string => e.split('').reverse().join('')).reverse();
        const expressions: string[] = expressionsRaw.filter((e: string): boolean => e.length > 0);
        expressions.forEach((item: string): AnalyzerResult => result.union(this.analyzeExpression(item)));

        return result;
    }

    private analyzeExpression(exp: string): AnalyzerResult {
        const result: AnalyzerResult =  new AnalyzerResult();
        exp = exp.replace(/(^@*)/g, '')
            .replace(/(^{*)/g, '')
            .replace(/(}*$)/g, '');
        const parsed: Expression = this._expressionParser.parse(exp);

        const references: readonly string[] = Extensions.references(parsed);
        result.union(new AnalyzerResult(references.slice(), []));
        result.union(this.analyzeExpressionDirectly(parsed));

        return  result;
    }

    private currentTarget(): EvaluationTarget {
        return this.evalutationTargetStack[this.evalutationTargetStack.length - 1];
    }

    private isPureExpression(exp: string): boolean {
        if (!exp) {
            return false;
        }

        exp = exp.trim();
        const reversedExps: RegExpMatchArray = exp.split('').reverse().join('').match(Evaluator.expressionRecognizeReverseRegex);
        // If there is no match, expressions could be null
        if (!reversedExps || reversedExps.length !== 1) {
            return false;
        } else {
            return reversedExps[0].split('').reverse().join('') === exp;
        }
    }
}
