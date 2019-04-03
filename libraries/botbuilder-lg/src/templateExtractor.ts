import { AbstractParseTreeVisitor } from 'antlr4ts/tree';
import * as lp from './generator/LGFileParser';
import { LGFileParserVisitor } from './generator/LGFileParserVisitor';
import { EvaluationContext } from './templateEngine';

export class TemplateExtractor extends AbstractParseTreeVisitor<Map<string, any>> implements LGFileParserVisitor<Map<string, any>> {
    public readonly Context:  EvaluationContext;
    constructor(context: EvaluationContext) {
        super();
        this.Context = context;
    }

    public Extract(): Map<string, any>[] {
        let result: Map<string, any>[] = [];
        this.Context.TemplateContexts.forEach(template => {
            result.push(this.visit(template));
        });

        return result;
    }

    public visitTemplateDefinition(context: lp.TemplateDefinitionContext): Map<string, any> {
        let result: Map<string, any> = new Map<string, any>();
        const templateName = context.templateNameLine().templateName().text;
        const templateBodies = this.visit(context.templateBody());
        let isNormalTemplate: boolean = true;
        templateBodies.forEach(templateBody => isNormalTemplate = isNormalTemplate && (templateBody === undefined));

        if (isNormalTemplate) {
            let templates: string[] = [];
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
        let result: Map<string, any> = new Map<string, any>();
        for (let templateStr of context.normalTemplateString()) {
            result.set(templateStr.text, undefined);
        }

        return result;
    }

    public visitConditionalBody(context: lp.ConditionalBodyContext): Map<string, any> {
        let result: Map<string, any> = new Map<string, any>();
        const caseRules: lp.CaseRuleContext[] = context.conditionalTemplateBody().caseRule();
        for (const caseRule of caseRules) {
            if (caseRule.caseCondition().EXPRESSION() !== undefined
                && caseRule.caseCondition().EXPRESSION().length > 0) {
                const conditionExpression: string = caseRule.caseCondition()
                    .EXPRESSION(0).text;
                let childTemplateBodyResult: string[] = [];
                const templateBodies = this.visit(caseRule.normalTemplateBody());
                for (const templateBody of templateBodies) {
                    childTemplateBodyResult.push(templateBody[0]);
                }

                result.set(conditionExpression, childTemplateBodyResult);
            }
        }

        if (context.conditionalTemplateBody() !== undefined && context.conditionalTemplateBody().defaultRule() !== undefined) {
            let childDefaultRuleResult: string[] = [];
            const defaultTemplateBodies = this.visit(context.conditionalTemplateBody().defaultRule().normalTemplateBody());
            for (const templateBody of defaultTemplateBodies) {
                childDefaultRuleResult.push(templateBody[0]);
            }

            result.set('DEFAULT', childDefaultRuleResult);
        }

        return result;
    }

    protected defaultResult(): Map<string, any> {
        return new Map<string, any>();
    }
}
