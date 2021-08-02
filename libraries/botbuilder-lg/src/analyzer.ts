/* eslint-disable security/detect-object-injection */
/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { AbstractParseTreeVisitor } from 'antlr4ts/tree';
import { AnalyzerResult } from './analyzerResult';
import { EvaluationOptions } from './evaluationOptions';
import { EvaluationTarget } from './evaluationTarget';
import { Evaluator } from './evaluator';
import { Expression, ExpressionParserInterface } from 'adaptive-expressions';
import { LGTemplateParserVisitor } from './generated/LGTemplateParserVisitor';
import { Template } from './template';
import { TemplateExtensions } from './templateExtensions';
import { Templates } from './templates';
import { keyBy } from 'lodash';

import {
    IfConditionRuleContext,
    IfElseBodyContext,
    KeyValueStructureLineContext,
    NormalBodyContext,
    NormalTemplateBodyContext,
    NormalTemplateStringContext,
    StructuredTemplateBodyContext,
    SwitchCaseBodyContext,
    SwitchCaseRuleContext,
} from './generated/LGTemplateParser';

/**
 * Analyzer engine. To get the static analyzer results.
 */
export class Analyzer
    extends AbstractParseTreeVisitor<AnalyzerResult>
    implements LGTemplateParserVisitor<AnalyzerResult> {
    /**
     * Templates.
     */
    public readonly templates: Templates;

    private readonly templateMap: { [name: string]: Template };
    private readonly evalutationTargetStack: EvaluationTarget[] = [];
    private readonly _expressionParser: ExpressionParserInterface;

    /**
     * Creates a new instance of the [Analyzer](xref:botbuilder-lg.Analyzer) class.
     * @param templates Templates.
     * @param opt Options for LG.
     */
    public constructor(templates: Templates, opt?: EvaluationOptions) {
        super();
        this.templates = templates;
        this.templateMap = keyBy(templates.allTemplates, (t: Template): string => t.name);

        // create an evaluator to leverage its customized function look up for checking
        const evaluator: Evaluator = new Evaluator(this.templates, opt);
        this._expressionParser = evaluator.expressionParser;
    }

    /**
     * Analyze a template to get the static analyzer results.
     * @param templateName Template name.
     * @returns Analyze result including variables and template references.
     */
    public analyzeTemplate(templateName: string): AnalyzerResult {
        if (
            !(templateName in this.templateMap) ||
            this.evalutationTargetStack.find((u: EvaluationTarget): boolean => u.templateName === templateName) !==
                undefined
        ) {
            return new AnalyzerResult();
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

    /**
     * Visit a parse tree produced by the normalBody labeled alternative in LGTemplateParser.body.
     * @param ctx The parse tree.
     * @returns The [AnalyzerResult](xref:botbuilder-lg.AnalyzerResult) instance.
     */
    public visitNormalBody(ctx: NormalBodyContext): AnalyzerResult {
        return this.visit(ctx.normalTemplateBody());
    }

    /**
     * Visit a parse tree produced by LGTemplateParser.normalTemplateBody.
     * @param ctx The parse tree.
     * @returns The [AnalyzerResult](xref:botbuilder-lg.AnalyzerResult) instance.
     */
    public visitNormalTemplateBody(ctx: NormalTemplateBodyContext): AnalyzerResult {
        const result: AnalyzerResult = new AnalyzerResult();
        for (const templateStr of ctx.templateString()) {
            result.union(this.visit(templateStr.normalTemplateString()));
        }

        return result;
    }

    /**
     * Visit a parse tree produced by LGTemplateParser.structuredTemplateBody.
     * @param ctx The parse tree.
     * @returns The [AnalyzerResult](xref:botbuilder-lg.AnalyzerResult) instance.
     */
    public visitStructuredTemplateBody(ctx: StructuredTemplateBodyContext): AnalyzerResult {
        const result: AnalyzerResult = new AnalyzerResult();

        const bodys = ctx.structuredBodyContentLine();
        for (const body of bodys) {
            const isKVPairBody = body.keyValueStructureLine() !== undefined;
            if (isKVPairBody) {
                result.union(this.visitStructureValue(body.keyValueStructureLine()));
            } else {
                result.union(this.analyzeExpression(body.expressionInStructure().text));
            }
        }

        return result;
    }

    /**
     * Visit a parse tree produced by LGTemplateParser.structuredValue.
     * @param ctx The parse tree.
     * @returns The [AnalyzerResult](xref:botbuilder-lg.AnalyzerResult) instance.
     */
    public visitStructureValue(ctx: KeyValueStructureLineContext): AnalyzerResult {
        const result: AnalyzerResult = new AnalyzerResult();

        const values = ctx.keyValueStructureValue();
        for (const item of values) {
            if (TemplateExtensions.isPureExpression(item)) {
                result.union(this.analyzeExpression(item.expressionInStructure(0).text));
            } else {
                const exprs = item.expressionInStructure();
                for (const expr of exprs) {
                    result.union(this.analyzeExpression(expr.text));
                }
            }
        }

        return result;
    }

    /**
     * Visit a parse tree produced by the ifElseBody labeled alternative in LGTemplateParser.body.
     * @param ctx The parse tree.
     * @returns The [AnalyzerResult](xref:botbuilder-lg.AnalyzerResult) instance.
     */
    public visitIfElseBody(ctx: IfElseBodyContext): AnalyzerResult {
        const result: AnalyzerResult = new AnalyzerResult();

        const ifRules: IfConditionRuleContext[] = ctx.ifElseTemplateBody().ifConditionRule();
        for (const ifRule of ifRules) {
            const expressions = ifRule.ifCondition().expression();
            if (expressions !== undefined && expressions.length > 0) {
                result.union(this.analyzeExpression(expressions[0].text));
            }
            if (ifRule.normalTemplateBody() !== undefined) {
                result.union(this.visit(ifRule.normalTemplateBody()));
            }
        }

        return result;
    }

    /**
     * Visit a parse tree produced by the switchCaseBody labeled alternative in LGTemplateParser.body.
     * @param ctx The parse tree.
     * @returns The [AnalyzerResult](xref:botbuilder-lg.AnalyzerResult) instance.
     */
    public visitSwitchCaseBody(ctx: SwitchCaseBodyContext): AnalyzerResult {
        const result: AnalyzerResult = new AnalyzerResult();
        const switchCaseNodes: SwitchCaseRuleContext[] = ctx.switchCaseTemplateBody().switchCaseRule();
        for (const iterNode of switchCaseNodes) {
            const expressions = iterNode.switchCaseStat().expression();
            if (expressions.length > 0) {
                result.union(this.analyzeExpression(expressions[0].text));
            }
            if (iterNode.normalTemplateBody()) {
                result.union(this.visit(iterNode.normalTemplateBody()));
            }
        }

        return result;
    }

    /**
     * Visit a parse tree produced by LGTemplateParser.normalTemplateString.
     * @param ctx The parse tree.
     * @returns The [AnalyzerResult](xref:botbuilder-lg.AnalyzerResult) instance.
     */
    public visitNormalTemplateString(ctx: NormalTemplateStringContext): AnalyzerResult {
        const result: AnalyzerResult = new AnalyzerResult();

        for (const expression of ctx.expression()) {
            result.union(this.analyzeExpression(expression.text));
        }

        return result;
    }

    /**
     * Gets the default value returned by visitor methods.
     * @returns An instance of the AnalyzerResult class.
     * @returns The [AnalyzerResult](xref:botbuilder-lg.AnalyzerResult) instance.
     */
    protected defaultResult(): AnalyzerResult {
        return new AnalyzerResult();
    }

    /**
     * @private
     */
    private analyzeExpressionDirectly(exp: Expression): AnalyzerResult {
        const result: AnalyzerResult = new AnalyzerResult();

        if (exp.type in this.templateMap) {
            const templateName: string = exp.type;
            result.union(new AnalyzerResult([], [templateName]));

            if (
                this.templateMap[templateName].parameters === undefined ||
                this.templateMap[templateName].parameters.length === 0
            ) {
                result.union(this.analyzeTemplate(templateName));
            } else if (!result.TemplateReferences.includes(templateName)) {
                // if template has params, just get the templateref without variables.
                result.union(new AnalyzerResult([], this.analyzeTemplate(templateName).TemplateReferences));
            }
        }

        if (exp.children !== undefined) {
            exp.children.forEach((e: Expression): AnalyzerResult => result.union(this.analyzeExpressionDirectly(e)));
        }

        return result;
    }

    /**
     * @private
     */
    private analyzeExpression(exp: string): AnalyzerResult {
        const result: AnalyzerResult = new AnalyzerResult();
        exp = TemplateExtensions.trimExpression(exp);
        const parsed: Expression = this._expressionParser.parse(exp);

        const references: readonly string[] = parsed.references();
        result.union(new AnalyzerResult(references.slice(), []));
        result.union(this.analyzeExpressionDirectly(parsed));

        return result;
    }
}
