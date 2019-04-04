import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import { ExpressionEngine } from 'botframework-expression';
import { LGReportMessage, LGReportMessageType } from './exception';
import * as lp from './generator/LGFileParser';
import { LGFileParserVisitor } from './generator/LGFileParserVisitor';
import { EvaluationContext } from './templateEngine';

// tslint:disable-next-line: completed-docs
export class StaticChecker extends AbstractParseTreeVisitor<LGReportMessage[]> implements LGFileParserVisitor<LGReportMessage[]> {
    public readonly Context:  EvaluationContext;
    constructor(context: EvaluationContext) {
        super();
        this.Context = context;
    }

    public Check(): LGReportMessage[] {
        let result: LGReportMessage[] = [];
        if (this.Context.TemplateContexts === undefined || this.Context.TemplateContexts.size <= 0) {
            result.push(new LGReportMessage(`File must have at least one template definition`, LGReportMessageType.Warning));
        } else {
            this.Context.TemplateContexts.forEach(template => {
                result = result.concat(this.visit(template));
            });
        }

        return result;
    }

    public visitTemplateDefinition(context: lp.TemplateDefinitionContext): LGReportMessage[] {
        let result: LGReportMessage[] = [];
        const templateName: string = context.templateNameLine().templateName().text;
        if (context.templateBody() === undefined) {
            result.push(new LGReportMessage(`There is no template body in template ${templateName}`));
        } else {
            result.concat(this.visit(context.templateBody()));
        }

        const parameters = context.templateNameLine().parameters();
        if (parameters !== undefined) {
            if (parameters.CLOSE_PARENTHESIS() === undefined|| parameters.OPEN_PARENTHESIS() === undefined) {
                result.push(new LGReportMessage(`parameters: ${parameters.text} format error`));
            }

            const invalidSeperateCharacters = parameters.INVALID_SEPERATE_CHAR();
            if (invalidSeperateCharacters !== undefined || invalidSeperateCharacters.length > 0) {
                result.push(new LGReportMessage(`Parameters for templates must be separated by comma.`));
            }
        }

        return result;
    }

    public visitNormalTemplateBody(context: lp.NormalTemplateBodyContext): LGReportMessage[] {
        let result: LGReportMessage[] = [];
        for (const templateStr of context.normalTemplateString()) {
            const item: LGReportMessage[] = this.visit(templateStr);
            result.concat(item);
        }

        return result;
    }

    public visitConditionalBody(context: lp.ConditionalBodyContext): LGReportMessage[] {
        let result: LGReportMessage[] = [];
        const ifRules = context.conditionalTemplateBody().ifConditionRule();

        let idx: number = 0;
        for(const ifRule of ifRules) {
            const conditionLabel = ifRule.ifCondition().IFELSE().text.toLowerCase();
            if (idx === 0 && conditionLabel !== 'if:') {
                result.push(new LGReportMessage(`condition is not start with if: '${context.conditionalTemplateBody().text}'`, LGReportMessageType.Warning));
            }

            if (idx > 0 && conditionLabel === 'if:') {
                result.push(new LGReportMessage(`condition can't have more than one if: '${context.conditionalTemplateBody().text}'`));
            }

            if (idx === ifRules.length - 1 && conditionLabel !== 'else:') {
                result.push(new LGReportMessage(`condition is not end with else: '${context.conditionalTemplateBody().text}'`, LGReportMessageType.Warning));
            }

            if (idx > 0 && idx < ifRules.length - 1 && conditionLabel !== 'elseif:') {
                result.push(new LGReportMessage(`only elseif is allowed in middle of condition: '${context.conditionalTemplateBody().text}'`));
            }

            if (conditionLabel !== 'else:') {
                if (ifRule.ifCondition().EXPRESSION().length !== 1) {
                    result.push(new LGReportMessage(`if and elseif should followed by one valid expression: '${ifRule.text}'`));
                }

                result = result.concat(this.CheckExpression(ifRule.ifCondition().EXPRESSION(0).text));
            } else {
                if (ifRule.ifCondition().EXPRESSION().length !== 0) {
                    result.push(new LGReportMessage(`else should not followed by any expression: '${ifRule.text}'`));
                }
            }

            result = result.concat(this.visit(ifRule.normalTemplateBody()));
            idx = idx + 1;
        }

        return result;
    }

    public visitNormalTemplateString(context: lp.NormalTemplateStringContext): LGReportMessage[] {
        const result: LGReportMessage[] = [];
        for (const child of context.children) {
            const node: TerminalNode = child as TerminalNode;
            switch (node.symbol.type) {
                case lp.LGFileParser.ESCAPE_CHARACTER:
                    result.concat(this.CheckEscapeCharacter(node.text));
                    break;
                case lp.LGFileParser.INVALID_ESCAPE:
                    result.push(new LGReportMessage(`escape character ${node.text} is invalid`));
                    break;
                case lp.LGFileParser.TEMPLATE_REF:
                    result.concat(this.CheckTemplateRef(node.text));
                    break;
                case lp.LGFileParser.EXPRESSION:
                    result.concat(this.CheckExpression(node.text));
                    break;
                case lp.LGFileParser.MULTI_LINE_TEXT:
                    result.concat(this.CheckMultiLineText(node.text));
                    break;
                case lp.LGFileParser.TEXT:
                    result.concat(this.CheckText(node.text));
                    break;
                default:
                    break;
            }
        }

        return result;
    }

    protected defaultResult(): LGReportMessage[] {
        return [];
    }

    private CheckTemplateRef(exp: string): LGReportMessage[] {
        let result: LGReportMessage[] = [];
        exp = exp.replace(/(^\[*)/g, '')
                .replace(/(\]*$)/g, '')
                .trim();

        const argsStartPos: number = exp.indexOf('(');
        if (argsStartPos > 0) {
            const argsEndPos: number = exp.lastIndexOf(')');
            if (argsEndPos < 0 || argsEndPos < argsStartPos + 1) {
                result.push(new LGReportMessage(`Not a valid template ref: ${exp}`));
            } else {
                 const templateName: string = exp.substr(0, argsStartPos);
                 if (!this.Context.TemplateContexts.has(templateName)) {
                     result.push(new LGReportMessage(`No such template: ${templateName}`));
                 } else {
                    var argsNumber = exp.substr(argsStartPos + 1, argsEndPos - argsStartPos - 1).split(',').length;
                    result.concat(this.CheckTemplateParameters(templateName, argsNumber));
                 }
            }
        } else {
            if (!this.Context.TemplateContexts.has(exp)) {
                result.push(new LGReportMessage(`No such template: ${exp}`));
            }
        }

        return result;
    }

    private CheckMultiLineText(exp: string): LGReportMessage[] {
        let result: LGReportMessage[] = [];
        exp = exp.substr(3, exp.length - 6);
        const matches: string[] = exp.match(/@\{[^{}]+\}/g);
        for (const match of matches) {
            const newExp: string = match.substr(1);
            if (newExp.startsWith('{[') && newExp.endsWith(']}')) {
                result.concat(this.CheckTemplateRef(newExp.substr(2, newExp.length - 4)));
            }
        }

        return result;
    }

    private CheckText(exp: string): LGReportMessage[] {
        let result: LGReportMessage[] = [];

        if (exp.startsWith("```")) {
            result.push(new LGReportMessage("Multi line variation must be enclosed in ```"));
        }

        return result;
    }

    private CheckTemplateParameters(templateName: string, argsNumber: number): LGReportMessage[] {
        let result: LGReportMessage[] = [];
        const parametersNumber = this.Context.TemplateParameters.has(templateName) ? this.Context.TemplateParameters.get(templateName).length : 0;

        if (argsNumber !== parametersNumber) {
            result.push(new LGReportMessage(`Arguments count mismatch for template ref ${templateName}, expected ${parametersNumber}, actual ${argsNumber}`));
        }

        return result;
    }

    private CheckExpression(exp: string): LGReportMessage[] {
        let result: LGReportMessage[] = [];
        exp = exp.replace(/(^{*)/g, '')
                .replace(/(}*$)/g, '')
                .trim();

        try {
            ExpressionEngine.Parse(exp);
        } catch (e) {
            result.push(new LGReportMessage(e));
        }

        return result;
    }

    private CheckEscapeCharacter(exp: string): LGReportMessage[] {
        let result: LGReportMessage[] = [];
        const validCharactersDict: any = {
            '\\r': '\r',
            '\\n': '\n',
            '\\t': '\t',
            '\\\\': '\\',
            '\\[': '[',
            '\\]': ']',
            '\\{': '{',
            '\\}': '}'
        };

        if (!Object.keys(validCharactersDict).includes(exp)) {
            result.push(new LGReportMessage(`escape character ${exp} is invalid`));
        }

        return result;
    }
}
