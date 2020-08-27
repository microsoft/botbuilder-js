
/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import { keyBy } from 'lodash';
import * as lp from './generated/LGTemplateParser';
import { LGTemplateParserVisitor } from './generated/LGTemplateParserVisitor';
import { Template } from './template';

/**
 * Lg template extracter.
 */
export class Extractor extends AbstractParseTreeVisitor<Map<string, any>> implements LGTemplateParserVisitor<Map<string, any>> {
    public readonly templates: Template[];
    public readonly templateMap: {[name: string]: Template};
    public constructor(templates: Template[]) {
        super();
        this.templates = templates;
        this.templateMap = keyBy(templates, (t: Template): string => t.name);
    }

    public extract(): Map<string, any>[] {
        const result: Map<string, any>[] = [];
        this.templates.forEach((template: Template): any => {
            const templateResult: Map<string, any> = new Map<string, any>();
            const templateName: string = template.name;
            const templateBodies = this.visit(template.templateBodyParseTree);
            let isNormalTemplate = true;
            templateBodies.forEach((templateBody: Map<string, any>): any => isNormalTemplate = isNormalTemplate && (templateBody === undefined));

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

    public visitNormalTemplateBody(context: lp.NormalTemplateBodyContext): Map<string, any> {
        const result: Map<string, any> = new Map<string, any>();
        for (const templateStr of context.templateString()) {
            result.set(templateStr.normalTemplateString().text, undefined);
        }

        return result;
    }

    public visitStructuredBody(context: lp.StructuredBodyContext): Map<string, any> {
        const result: Map<string, any> = new Map<string, any>();
        const lineStart = '    ';
        const structName = context.structuredTemplateBody().structuredBodyNameLine().text;
        let fullStr = structName + '\n';
        context.structuredTemplateBody().structuredBodyContentLine().forEach((line): string => fullStr += lineStart + line.text + '\n');
        fullStr += context.structuredTemplateBody().structuredBodyEndLine().text;

        result.set(fullStr, undefined);
        return result;
    }

    public visitIfElseBody(context: lp.IfElseBodyContext): Map<string, any> {
        const result: Map<string, any> = new Map<string, any>();
        const ifRules: lp.IfConditionRuleContext[] = context.ifElseTemplateBody().ifConditionRule();
        for (const ifRule of ifRules) {
            const expressions = ifRule.ifCondition().expression();
            const  conditionNode: lp.IfConditionContext = ifRule.ifCondition();
            const ifExpr: boolean = conditionNode.IF() !== undefined;
            const elseIfExpr: boolean = conditionNode.ELSEIF() !== undefined;

            const node: TerminalNode = ifExpr ? conditionNode.IF() :
                elseIfExpr ? conditionNode.ELSEIF() :
                    conditionNode.ELSE();
            const conditionLabel: string = node.text.toLowerCase();
            const childTemplateBodyResult: string[] = [];
            const templateBodies: Map<string, any> = this.visit(ifRule.normalTemplateBody());
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

    public visitSwitchCaseBody(context: lp.SwitchCaseBodyContext): Map<string, any> {
        const result: Map<string, any> = new Map<string, any>();
        const switchCaseNodes: lp.SwitchCaseRuleContext[] = context.switchCaseTemplateBody().switchCaseRule();
        for (const iterNode of switchCaseNodes) {
            const expressions = iterNode.switchCaseStat().expression();
            const switchCaseStat: lp.SwitchCaseStatContext = iterNode.switchCaseStat();
            const switchExpr: boolean = switchCaseStat.SWITCH() !== undefined;
            const caseExpr: boolean = switchCaseStat.CASE() !== undefined;

            const node: TerminalNode = switchExpr ? switchCaseStat.SWITCH() :
                caseExpr ? switchCaseStat.CASE() :
                    switchCaseStat.DEFAULT();
            if (switchExpr) {
                continue;
            }
            const conditionLabel: string = node.text.toLowerCase();
            const childTemplateBodyResult: string[] = [];
            const templateBodies: Map<string, any> = this.visit(iterNode.normalTemplateBody());
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

    protected defaultResult(): Map<string, any> {
        return new Map<string, any>();
    }
}
