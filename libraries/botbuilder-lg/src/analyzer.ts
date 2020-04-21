/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import { Expression, ExpressionParserInterface, ExpressionParser } from 'adaptive-expressions';
import { keyBy } from 'lodash';
import { EvaluationTarget } from './evaluationTarget';
import { Evaluator } from './evaluator';
import * as lp from './generated/LGTemplateParser';
import { LGTemplateParserVisitor } from './generated/LGTemplateParserVisitor';
import { Template } from './template';
import { TemplateExtensions } from './templateExtensions';
import { AnalyzerResult } from './analyzerResult';
import {TemplateErrors} from './templateErrors';

/**
 * Analyzer engine. To to get the static analyzer results.
 */
export class Analyzer extends AbstractParseTreeVisitor<AnalyzerResult> implements LGTemplateParserVisitor<AnalyzerResult> {
    /**
     * Templates.
     */
    public readonly templates: Template[];

    private readonly templateMap: {[name: string]: Template};
    private readonly evalutationTargetStack: EvaluationTarget[] = [];
    private readonly _expressionParser: ExpressionParserInterface;

    public constructor(templates: Template[], expressionParser: ExpressionParser) {
        super();
        this.templates = templates;
        this.templateMap = keyBy(templates, (t: Template): string => t.name);

        // create an evaluator to leverage its customized function look up for checking
        const evaluator: Evaluator = new Evaluator(this.templates, expressionParser);
        this._expressionParser = evaluator.expressionParser;
    }

    /**
     * Analyze a template to get the static analyzer results.
     * @param templateName Template name.
     * @returns Analyze result including variables and template references.
     */
    public analyzeTemplate(templateName: string): AnalyzerResult {
        if (!(templateName in this.templateMap)) {
            throw new Error(TemplateErrors.templateNotExist(templateName));
        }

        if (this.evalutationTargetStack.find((u: EvaluationTarget): boolean => u.templateName === templateName) !== undefined) {
            throw new Error(`${ TemplateErrors.loopDetected } ${ this.evalutationTargetStack.reverse()
                .map((u: EvaluationTarget): string => u.templateName)
                .join(' => ') }`);
        }

        // Using a stack to track the evalution trace
        this.evalutationTargetStack.push(new EvaluationTarget(templateName, undefined));

        // we don't exclude paratemters any more
        // because given we don't track down for templates have parameters
        // the only scenario that we are still analyzing an parameterized template is
        // this template is root template to anaylze, in this we also don't have exclude parameters
        const dependencies: AnalyzerResult = this.visit(this.templateMap[templateName].templateBodyParseTree);
        this.evalutationTargetStack.pop();

        return dependencies;
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

        const bodys = ctx.structuredBodyContentLine();
        for (const body  of bodys) {
            const isKVPairBody = body.keyValueStructureLine() !== undefined;
            if (isKVPairBody) {
                result.union(this.visitStructureValue(body.keyValueStructureLine()));
            } else {
                result.union(this.analyzeExpression(body.objectStructureLine().text));
            }
        }

        return result;
    }

    public visitStructureValue(ctx: lp.KeyValueStructureLineContext): AnalyzerResult {
        const result: AnalyzerResult = new AnalyzerResult();

        const values = ctx.keyValueStructureValue();
        for (const value of values) {
            if (TemplateExtensions.isPureExpression(value).hasExpr) {
                result.union(this.analyzeExpression(TemplateExtensions.isPureExpression(value).expression));
            } else {
                const exprs = value.EXPRESSION_IN_STRUCTURE_BODY();
                for (const expr of exprs) {
                    result.union(this.analyzeExpression(expr.text));
                }
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

    private analyzeExpression(exp: string): AnalyzerResult {
        const result: AnalyzerResult =  new AnalyzerResult();
        exp = TemplateExtensions.trimExpression(exp);
        const parsed: Expression = this._expressionParser.parse(exp);

        const references: readonly string[] = parsed.references();
        result.union(new AnalyzerResult(references.slice(), []));
        result.union(this.analyzeExpressionDirectly(parsed));

        return  result;
    }

    private currentTarget(): EvaluationTarget {
        return this.evalutationTargetStack[this.evalutationTargetStack.length - 1];
    }
}