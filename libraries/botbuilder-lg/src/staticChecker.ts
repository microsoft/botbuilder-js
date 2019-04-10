/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line: no-submodule-imports
import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import { ExpressionEngine } from 'botbuilder-expression-parser';
import { keyBy } from 'lodash';
import * as lp from './generated/LGFileParser';
import { LGFileParserVisitor } from './generated/LGFileParserVisitor';
import { GetMethodExtensions } from './getMethodExtensions';
import { LGTemplate } from './lgTemplate';

export enum ReportEntryType {
    ERROR,
    WARN
}

/**
 * Error/Warning report message entry
 */
export class ReportEntry {
    public Type: ReportEntryType;
    public Message: string;
    public constructor(message: string, type: ReportEntryType = ReportEntryType.ERROR) {
        this.Message = message;
        this.Type = type;
    }

    public toString(): string {
        const label: string = this.Type === ReportEntryType.ERROR ? '[ERROR]' : '[WARN]';

        return `${label}: ${this.Message}`;
    }
}
// tslint:disable-next-line: completed-docs
export class StaticChecker extends AbstractParseTreeVisitor<ReportEntry[]> implements LGFileParserVisitor<ReportEntry[]> {
    public readonly Templates:  LGTemplate[];
    public TemplateMap: {[name: string]: LGTemplate};
    constructor(templates: LGTemplate[]) {
        super();
        this.Templates = templates;
    }

    public Check(): ReportEntry[] {
        let result: ReportEntry[] = [];

        // check dup, before we build up TemplateMap
        const grouped: {[name: string]: LGTemplate[]} = {};
        this.Templates.forEach((t: LGTemplate) => {
            if (!(t.Name in grouped)) {
                grouped[t.Name] = [];
            }
            grouped[t.Name].push(t);
        });

        for (const key in grouped) {
            const group: LGTemplate[] = grouped[key];
            if (group.length > 1) {
                const sources: string = group.map(x => x.Source).join(':');
                result.push(new ReportEntry(`Dup definitions found for template  ${key} in ${sources}`));
            }
        }

        if (result.length > 0) {
            // can't check other errors if there is a dup
            return result;
        }

        // we can safely convert now, because we know there is no dup
        this.TemplateMap = keyBy(this.Templates, (t: LGTemplate) => t.Name);

        if (this.Templates.length <= 0) {
            result.push(new ReportEntry(`File must have at least one template definition`, ReportEntryType.WARN));
        }

        this.Templates.forEach((template: LGTemplate) => {
            result = result.concat(this.visit(template.ParseTree));
        });

        return result;
    }

    public visitTemplateDefinition(context: lp.TemplateDefinitionContext): ReportEntry[] {
        let result: ReportEntry[] = [];
        const templateName: string = context.templateNameLine().templateName().text;
        if (context.templateBody() === undefined) {
            result.push(new ReportEntry(`There is no template body in template ${templateName}`));
        } else {
            result = result.concat(this.visit(context.templateBody()));
        }

        const parameters: lp.ParametersContext = context.templateNameLine().parameters();
        if (parameters !== undefined) {
            if (parameters.CLOSE_PARENTHESIS() === undefined || parameters.OPEN_PARENTHESIS() === undefined) {
                result.push(new ReportEntry(`parameters: ${parameters.text} format error`));
            }

            const invalidSeperateCharacters: TerminalNode[] = parameters.INVALID_SEPERATE_CHAR();

            if (invalidSeperateCharacters !== undefined
                && invalidSeperateCharacters.length > 0) {
                result.push(new ReportEntry(`Parameters for templates must be separated by comma.`));
            }
        }

        return result;
    }

    public visitNormalTemplateBody(context: lp.NormalTemplateBodyContext): ReportEntry[] {
        let result: ReportEntry[] = [];
        for (const templateStr of context.normalTemplateString()) {
            const item: ReportEntry[] = this.visit(templateStr);
            result = result.concat(item);
        }

        return result;
    }

    public visitConditionalBody(context: lp.ConditionalBodyContext): ReportEntry[] {
        let result: ReportEntry[] = [];
        const ifRules: lp.IfConditionRuleContext[] = context.conditionalTemplateBody().ifConditionRule();

        let idx: number = 0;
        for (const ifRule of ifRules) {
            const conditionLabel: string = ifRule.ifCondition().IFELSE().text.toLowerCase();
            if (idx === 0 && conditionLabel !== 'if:') {
                result.push(new ReportEntry(`condition is not start with if: '${context.conditionalTemplateBody().text}'`,
                                            ReportEntryType.WARN));
            }

            if (idx > 0 && conditionLabel === 'if:') {
                result.push(new ReportEntry(`condition can't have more than one if: '${context.conditionalTemplateBody().text}'`));
            }

            if (idx === ifRules.length - 1 && conditionLabel !== 'else:') {
                result.push(new ReportEntry(`condition is not end with else: '${context.conditionalTemplateBody().text}'`,
                                            ReportEntryType.WARN));
            }

            if (idx > 0 && idx < ifRules.length - 1 && conditionLabel !== 'elseif:') {
                result.push(new ReportEntry(`only elseif is allowed in middle of condition: '${context.conditionalTemplateBody().text}'`));
            }

            if (conditionLabel !== 'else:') {
                if (ifRule.ifCondition().EXPRESSION().length !== 1) {
                    result.push(new ReportEntry(`if and elseif should followed by one valid expression: '${ifRule.text}'`));
                } else {
                    result = result.concat(this.CheckExpression(ifRule.ifCondition().EXPRESSION(0).text));
                }
            } else {
                if (ifRule.ifCondition().EXPRESSION().length !== 0) {
                    result.push(new ReportEntry(`else should not followed by any expression: '${ifRule.text}'`));
                }
            }
            if (ifRule.normalTemplateBody() !== undefined) {
                result = result.concat(this.visit(ifRule.normalTemplateBody()));
            } else {
                result.push(new ReportEntry(`no normal template body in condition block: '${ifRule.text}'`));
            }

            idx = idx + 1;
        }

        return result;
    }

    public visitNormalTemplateString(context: lp.NormalTemplateStringContext): ReportEntry[] {
        let result: ReportEntry[] = [];
        for (const child of context.children) {
            const node: TerminalNode = child as TerminalNode;
            switch (node.symbol.type) {
                case lp.LGFileParser.ESCAPE_CHARACTER: {
                    result = result.concat(this.CheckEscapeCharacter(node.text));
                    break;
                }
                case lp.LGFileParser.INVALID_ESCAPE: {
                    result.push(new ReportEntry(`escape character ${node.text} is invalid`));
                    break;
                }
                case lp.LGFileParser.TEMPLATE_REF: {
                    result = result.concat(this.CheckTemplateRef(node.text));
                    break;
                }
                case lp.LGFileParser.EXPRESSION: {
                    result = result.concat(this.CheckExpression(node.text));
                    break;
                }
                case lp.LGFileParser.MULTI_LINE_TEXT: {
                    result = result.concat(this.CheckMultiLineText(node.text));
                    break;
                }
                case lp.LGFileParser.TEXT: {
                    result = result.concat(this.CheckText(node.text));
                    break;
                }
                default:
                    break;
            }
        }

        return result;
    }

    protected defaultResult(): ReportEntry[] {
        return [];
    }

    private CheckTemplateRef(exp: string): ReportEntry[] {
        let result: ReportEntry[] = [];
        exp = exp.replace(/(^\[*)/g, '')
                .replace(/(\]*$)/g, '')
                .trim();

        const argsStartPos: number = exp.indexOf('(');
        if (argsStartPos > 0) {
            const argsEndPos: number = exp.lastIndexOf(')');
            if (argsEndPos < 0 || argsEndPos < argsStartPos + 1) {
                result.push(new ReportEntry(`Not a valid template ref: ${exp}`));
            } else {
                 const templateName: string = exp.substr(0, argsStartPos);
                 if (!(templateName in this.TemplateMap)) {
                     result.push(new ReportEntry(`No such template: ${templateName}`));
                 } else {
                    const argsNumber: number = exp.substr(argsStartPos + 1, argsEndPos - argsStartPos - 1).split(',').length;
                    result = result.concat(this.CheckTemplateParameters(templateName, argsNumber));
                 }
            }
        } else {
            if (!(exp in this.TemplateMap)) {
                result.push(new ReportEntry(`No such template: ${exp}`));
            }
        }

        return result;
    }

    private CheckMultiLineText(exp: string): ReportEntry[] {
        let result: ReportEntry[] = [];
        exp = exp.substr(3, exp.length - 6);
        const matches: string[] = exp.match(/@\{[^{}]+\}/g);
        if (matches !== null && matches !== undefined) {
            for (const match of matches) {
                const newExp: string = match.substr(1);
                if (newExp.startsWith('{[') && newExp.endsWith(']}')) {
                    result = result.concat(this.CheckTemplateRef(newExp.substr(2, newExp.length - 4)));
                }
            }
        }

        return result;
    }

    private CheckText(exp: string): ReportEntry[] {
        const result: ReportEntry[] = [];

        if (exp.startsWith('```')) {
            result.push(new ReportEntry('Multi line variation must be enclosed in ```'));
        }

        return result;
    }

    private CheckTemplateParameters(templateName: string, argsNumber: number): ReportEntry[] {
        const result: ReportEntry[] = [];
        const parametersNumber: number = this.TemplateMap[templateName].Parameters.length;

        if (argsNumber !== parametersNumber) {
            result.push(new ReportEntry(
                `Arguments count mismatch for template ref ${templateName}, expected ${parametersNumber}, actual ${argsNumber}`));
        }

        return result;
    }

    private CheckExpression(exp: string): ReportEntry[] {
        const result: ReportEntry[] = [];
        exp = exp.replace(/(^{*)/g, '')
                .replace(/(}*$)/g, '')
                .trim();

        try {
            new ExpressionEngine(new GetMethodExtensions(undefined).GetMethodX).parse(exp);
        } catch (e) {
            result.push(new ReportEntry(e));
        }

        return result;
    }

    private CheckEscapeCharacter(exp: string): ReportEntry[] {
        const result: ReportEntry[] = [];
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
            result.push(new ReportEntry(`escape character ${exp} is invalid`));
        }

        return result;
    }
}
