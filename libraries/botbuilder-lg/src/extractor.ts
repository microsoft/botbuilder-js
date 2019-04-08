import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import * as lp from './generated/LGFileParser';
import { LGFileParserVisitor } from './generated/LGFileParserVisitor';
import { EvaluationContext } from './templateEngine';

export class Extractor extends AbstractParseTreeVisitor<Map<string, any>> implements LGFileParserVisitor<Map<string, any>> {
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
        const ifRules: lp.IfConditionRuleContext[] = context.conditionalTemplateBody().ifConditionRule();
        for (const ifRule of ifRules) {
            const expression: TerminalNode = ifRule.ifCondition().EXPRESSION(0);
            if (expression !== undefined) {
                let childTemplateBodyResult: string[] = [];
                const templateBodies = this.visit(ifRule.normalTemplateBody());
                for (const templateBody of templateBodies) {
                    childTemplateBodyResult.push(templateBody[0]);
                }

                if (expression.text !== undefined)
                {
                    result.set(expression.text, childTemplateBodyResult);
                } else {
                    result.set("ELSE", childTemplateBodyResult);
                }
            }
        }

        return result;
    }

    protected defaultResult(): Map<string, any> {
        return new Map<string, any>();
    }
}
