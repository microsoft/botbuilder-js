
/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line: no-submodule-imports
import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import { keyBy } from 'lodash';
import * as lp from './generated/LGFileParser';
import { LGFileParserVisitor } from './generated/LGFileParserVisitor';
import { LGTemplate } from './lgTemplate';

// tslint:disable-next-line: completed-docs
/**
 * Lg template extracter.
 */
export class Extractor extends AbstractParseTreeVisitor<Map<string, any>> implements LGFileParserVisitor<Map<string, any>> {
    public readonly templates: LGTemplate[];
    public readonly templateMap: {[name: string]: LGTemplate};
    public constructor(templates: LGTemplate[]) {
        super();
        this.templates = templates;
        this.templateMap = keyBy(templates, (t: LGTemplate): string => t.name);
    }

    public extract(): Map<string, any>[] {
        const result: Map<string, any>[] = [];
        this.templates.forEach((template: LGTemplate): any => {
            result.push(this.visit(template.parseTree));
        });

        return result;
    }

    public visitTemplateDefinition(context: lp.TemplateDefinitionContext): Map<string, any> {
        const result: Map<string, any> = new Map<string, any>();
        const templateName: string = context.templateNameLine().templateName().text;
        const templateBodies: Map<string, any> = this.visit(context.templateBody());
        let isNormalTemplate = true;
        templateBodies.forEach((templateBody: Map<string, any>): any => isNormalTemplate = isNormalTemplate && (templateBody === undefined));

        if (isNormalTemplate) {
            const templates: string[] = [];
            for (const templateBody of templateBodies) {
                templates.push(templateBody[0]);
            }
            result.set(templateName, templates);
        } else {
            result.set(templateName, templateBodies);
        }

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
        context.structuredTemplateBody().structuredBodyContentLine().forEach(line => fullStr += lineStart + line.text + '\n');
        fullStr += context.structuredTemplateBody().structuredBodyEndLine().text;

        result.set(fullStr, undefined);
        return result;
    }

    public visitIfElseBody(context: lp.IfElseBodyContext): Map<string, any> {
        const result: Map<string, any> = new Map<string, any>();
        const ifRules: lp.IfConditionRuleContext[] = context.ifElseTemplateBody().ifConditionRule();
        for (const ifRule of ifRules) {
            const expressions: TerminalNode[] = ifRule.ifCondition().EXPRESSION();
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
                // tslint:disable-next-line: no-backbone-get-set-outside-model
                result.set('ELSE:', childTemplateBodyResult);
            }
        }

        return result;
    }

    public visitSwitchCaseBody(context: lp.SwitchCaseBodyContext): Map<string, any> {
        const result: Map<string, any> = new Map<string, any>();
        const switchCaseNodes: lp.SwitchCaseRuleContext[] = context.switchCaseTemplateBody().switchCaseRule();
        for (const iterNode of switchCaseNodes) {
            const expressions: TerminalNode[] = iterNode.switchCaseStat().EXPRESSION();
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
                // tslint:disable-next-line: no-backbone-get-set-outside-model
                result.set('DEFALUT:', childTemplateBodyResult);
            }
        }

        return result;
    }

    protected defaultResult(): Map<string, any> {
        return new Map<string, any>();
    }
}
