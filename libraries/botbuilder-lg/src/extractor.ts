/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import keyBy = require('lodash/keyBy');
import { LGTemplateParserVisitor } from './generated/LGTemplateParserVisitor';
import { Template } from './template';

import {
    IfConditionContext,
    IfConditionRuleContext,
    IfElseBodyContext,
    NormalTemplateBodyContext,
    StructuredBodyContext,
    SwitchCaseBodyContext,
    SwitchCaseRuleContext,
    SwitchCaseStatContext,
} from './generated/LGTemplateParser';

/**
 * Lg template extracter.
 */
export class Extractor
    extends AbstractParseTreeVisitor<Map<string, string[]>>
    implements LGTemplateParserVisitor<Map<string, string[]>> {
    readonly templates: Template[];

    readonly templateMap: Record<string, Template>;

    /**
     * Creates a new instance of the [Extractor](xref:botbuilder-lg.Extractor) class.
     *
     * @param templates Template list.
     */
    constructor(templates: Template[]) {
        super();
        this.templates = templates;
        this.templateMap = keyBy(templates, (t: Template): string => t.name);
    }

    /**
     * Extracts the templates and returns a map with their names and bodies.
     *
     * @returns Map object with template names and bodies.
     */
    extract(): Map<string, string[] | Map<string, string[]>>[] {
        const result: Map<string, string[] | Map<string, string[]>>[] = [];
        this.templates.forEach((template: Template) => {
            const templateResult = new Map<string, string[] | Map<string, string[]>>();
            const templateName: string = template.name;
            const templateBodies = this.visit(template.templateBodyParseTree);
            let isNormalTemplate = true;
            templateBodies.forEach(
                (templateBody) => (isNormalTemplate = isNormalTemplate && templateBody === undefined)
            );

            if (isNormalTemplate) {
                const templates: string[] = [];
                for (const templateBody of templateBodies) {
                    templates.push(templateBody[0]);
                }
                templateResult.set(templateName, templates);
            } else {
                templateResult.set(templateName, templateBodies);
            }

            result.push(templateResult);
        });

        return result;
    }

    /**
     * Visit a parse tree produced by LGTemplateParser.normalTemplateBody.
     *
     * @param context The parse tree.
     * @returns The result of visiting the normal template body.
     */
    visitNormalTemplateBody(context: NormalTemplateBodyContext): Map<string, string[]> {
        const result = new Map<string, string[]>();
        for (const templateStr of context.templateString()) {
            result.set(templateStr.normalTemplateString().text, undefined);
        }

        return result;
    }

    /**
     * Visit a parse tree produced by the structuredBody labeled alternative in LGTemplateParser.body.
     *
     * @param context The parse tree.
     * @returns The result of visiting the structured body.
     */
    visitStructuredBody(context: StructuredBodyContext): Map<string, string[]> {
        const result = new Map<string, string[]>();
        const lineStart = '    ';
        const structName = context.structuredTemplateBody().structuredBodyNameLine().text;
        let fullStr = structName + '\n';
        context
            .structuredTemplateBody()
            .structuredBodyContentLine()
            .forEach((line): string => (fullStr += lineStart + line.text + '\n'));
        fullStr += context.structuredTemplateBody().structuredBodyEndLine().text;

        result.set(fullStr, undefined);
        return result;
    }

    /**
     * Visit a parse tree produced by the ifElseBody labeled alternative in LGTemplateParser.body.
     *
     * @param context The parse tree.
     * @returns The result of visiting the if else body.
     */
    visitIfElseBody(context: IfElseBodyContext): Map<string, string[]> {
        const result = new Map<string, string[]>();
        const ifRules: IfConditionRuleContext[] = context.ifElseTemplateBody().ifConditionRule();
        for (const ifRule of ifRules) {
            const expressions = ifRule.ifCondition().expression();
            const conditionNode: IfConditionContext = ifRule.ifCondition();
            const ifExpr: boolean = conditionNode.IF() !== undefined;
            const elseIfExpr: boolean = conditionNode.ELSEIF() !== undefined;

            const node: TerminalNode = ifExpr
                ? conditionNode.IF()
                : elseIfExpr
                ? conditionNode.ELSEIF()
                : conditionNode.ELSE();
            const conditionLabel: string = node.text.toLowerCase();
            const childTemplateBodyResult: string[] = [];
            const templateBodies = this.visit(ifRule.normalTemplateBody());
            for (const templateBody of templateBodies) {
                childTemplateBodyResult.push(templateBody[0]);
            }

            if (expressions !== undefined && expressions.length > 0) {
                if (expressions[0].text !== undefined) {
                    result.set(conditionLabel.toUpperCase().concat(' ') + expressions[0].text, childTemplateBodyResult);
                }
            } else {
                result.set('ELSE:', childTemplateBodyResult);
            }
        }

        return result;
    }

    /**
     * Visit a parse tree produced by the switchCaseBody labeled alternative in LGTemplateParser.body.
     *
     * @param context The parse tree.
     * @returns The result of visiting the switch case body.
     */
    visitSwitchCaseBody(context: SwitchCaseBodyContext): Map<string, string[]> {
        const result = new Map<string, string[]>();
        const switchCaseNodes: SwitchCaseRuleContext[] = context.switchCaseTemplateBody().switchCaseRule();
        for (const iterNode of switchCaseNodes) {
            const expressions = iterNode.switchCaseStat().expression();
            const switchCaseStat: SwitchCaseStatContext = iterNode.switchCaseStat();
            const switchExpr: boolean = switchCaseStat.SWITCH() !== undefined;
            const caseExpr: boolean = switchCaseStat.CASE() !== undefined;

            const node: TerminalNode = switchExpr
                ? switchCaseStat.SWITCH()
                : caseExpr
                ? switchCaseStat.CASE()
                : switchCaseStat.DEFAULT();
            if (switchExpr) {
                continue;
            }
            const conditionLabel: string = node.text.toLowerCase();
            const childTemplateBodyResult: string[] = [];
            const templateBodies = this.visit(iterNode.normalTemplateBody());
            for (const templateBody of templateBodies) {
                childTemplateBodyResult.push(templateBody[0]);
            }

            if (caseExpr) {
                result.set(conditionLabel.toUpperCase().concat(' ') + expressions[0].text, childTemplateBodyResult);
            } else {
                result.set('DEFALUT:', childTemplateBodyResult);
            }
        }

        return result;
    }

    /**
     * Gets the default value returned by visitor methods.
     *
     * @returns Empty Map<string,  string[]>.
     */
    protected defaultResult(): Map<string, string[]> {
        return new Map<string, string[]>();
    }
}
