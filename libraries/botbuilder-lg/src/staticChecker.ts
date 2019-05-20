/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line: no-submodule-imports
import { ParserRuleContext } from 'antlr4ts';
import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import { ExpressionEngine } from 'botbuilder-expression-parser';
import { keyBy } from 'lodash';
import { Diagnostic, DiagnosticSeverity, Position, Range } from './diagnostic';
import { Evaluator } from './evaluator';
import * as lp from './generated/LGFileParser';
import { LGFileParserVisitor } from './generated/LGFileParserVisitor';
import { GetMethodExtensions } from './getMethodExtensions';
import { LGTemplate } from './lgTemplate';
import { type } from 'os';

// tslint:disable-next-line: completed-docs
export class StaticChecker extends AbstractParseTreeVisitor<Diagnostic[]> implements LGFileParserVisitor<Diagnostic[]> {
    public readonly Templates:  LGTemplate[];
    public TemplateMap: {[name: string]: LGTemplate};
    constructor(templates: LGTemplate[]) {
        super();
        this.Templates = templates;
    }

    public Check(): Diagnostic[] {
        let result: Diagnostic[] = [];

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
                result.push(this.BuildLGDiagnostic({ message: `Dup definitions found for template  ${key} in ${sources}` }));
            }
        }

        if (result.length > 0) {
            // can't check other errors if there is a dup
            return result;
        }

        // we can safely convert now, because we know there is no dup
        this.TemplateMap = keyBy(this.Templates, (t: LGTemplate) => t.Name);

        if (this.Templates.length <= 0) {
            result.push(this.BuildLGDiagnostic({
                message: `File must have at least one template definition`,
                severity: DiagnosticSeverity.Warning
            }));
        }

        this.Templates.forEach((template: LGTemplate) => {
            result = result.concat(this.visit(template.ParseTree));
        });

        return result;
    }

    public visitTemplateDefinition(context: lp.TemplateDefinitionContext): Diagnostic[] {
        let result: Diagnostic[] = [];
        const templateName: string = context.templateNameLine().templateName().text;
        if (context.templateBody() === undefined) {
            result.push(this.BuildLGDiagnostic({
                message: `There is no template body in template ${templateName}`,
                context: context.templateNameLine()
            }));
        } else {
            result = result.concat(this.visit(context.templateBody()));
        }

        const parameters: lp.ParametersContext = context.templateNameLine().parameters();
        if (parameters !== undefined) {
            if (parameters.CLOSE_PARENTHESIS() === undefined || parameters.OPEN_PARENTHESIS() === undefined) {
                result.push(this.BuildLGDiagnostic({
                    message: `parameters: ${parameters.text} format error`,
                    context: context.templateNameLine()}));
            }

            const invalidSeperateCharacters: TerminalNode[] = parameters.INVALID_SEPERATE_CHAR();

            if (invalidSeperateCharacters !== undefined
                && invalidSeperateCharacters.length > 0) {
                result.push(this.BuildLGDiagnostic({
                    message: `Parameters for templates must be separated by comma.`,
                    context: context.templateNameLine()
                }));
            }
        }

        return result;
    }

    public visitNormalTemplateBody(context: lp.NormalTemplateBodyContext): Diagnostic[] {
        let result: Diagnostic[] = [];
        for (const templateStr of context.normalTemplateString()) {
            const item: Diagnostic[] = this.visit(templateStr);
            result = result.concat(item);
        }

        return result;
    }

    public visitConditionalBody(context: lp.ConditionalBodyContext): Diagnostic[] {
        let result: Diagnostic[] = [];
        const ifRules: lp.IfConditionRuleContext[] = context.conditionalTemplateBody().ifConditionRule();

        let idx: number = 0;
        for (const ifRule of ifRules) {
            const  conditionNode : lp.IfConditionContext = ifRule.ifCondition();
            const ifExpr : boolean = conditionNode.IF() !== undefined;
            const elseIfExpr : boolean = conditionNode.ELSEIF() !== undefined;
            const elseExpr : boolean = conditionNode.ELSE() !== undefined;

            const node : TerminalNode = ifExpr ? conditionNode.IF() :
                         elseIfExpr ? conditionNode.ELSEIF() :
                         conditionNode.ELSE();

            if (node.text.split(' ').length - 1 > 1) {
                result.push(this.BuildLGDiagnostic({
                    // tslint:disable-next-line: max-line-length
                    message: `At most 1 whitespace is allowed between IF/ELSEIF/ELSE and :. expression: '${context.conditionalTemplateBody().text}'`,
                    context: conditionNode
                }));
            }

            if (idx === 0 && !ifExpr) {
                result.push(this.BuildLGDiagnostic({
                    message: `condition is not start with if: '${context.conditionalTemplateBody().text}'`,
                    severity: DiagnosticSeverity.Warning,
                    context: conditionNode
                }));
            }

            if (idx > 0 && ifExpr) {
                result.push(this.BuildLGDiagnostic({
                    message: `condition can't have more than one if: '${context.conditionalTemplateBody().text}'`,
                    context: conditionNode
                }));
            }

            if (idx === ifRules.length - 1 && !elseExpr) {
                result.push(this.BuildLGDiagnostic({
                    message: `condition is not end with else: '${context.conditionalTemplateBody().text}'`,
                    severity: DiagnosticSeverity.Warning,
                    context: conditionNode
                }));
            }

            if (idx > 0 && idx < ifRules.length - 1 && !elseIfExpr) {
                result.push(this.BuildLGDiagnostic({
                    message: `only elseif is allowed in middle of condition: '${context.conditionalTemplateBody().text}'`,
                    context: conditionNode
                }));
            }

            if (!elseExpr) {
                if (ifRule.ifCondition().EXPRESSION().length !== 1) {
                    result.push(this.BuildLGDiagnostic({
                        message: `if and elseif should followed by one valid expression: '${ifRule.text}'`,
                        context: conditionNode
                    }));
                } else {
                    result = result.concat(this.CheckExpression(ifRule.ifCondition().EXPRESSION(0).text, conditionNode));
                }
            } else {
                if (ifRule.ifCondition().EXPRESSION().length !== 0) {
                    result.push(this.BuildLGDiagnostic({
                        message: `else should not followed by any expression: '${ifRule.text}'`,
                        context: conditionNode
                    }));
                }
            }
            if (ifRule.normalTemplateBody() !== undefined) {
                result = result.concat(this.visit(ifRule.normalTemplateBody()));
            } else {
                result.push(this.BuildLGDiagnostic({
                    message: `no normal template body in condition block: '${ifRule.text}'`,
                    context: conditionNode
                }));
            }

            idx = idx + 1;
        }

        return result;
    }

    public visitSwitchCaseBody(context: lp.SwitchCaseBodyContext): Diagnostic[] {
        let result :Diagnostic[] = [];
        const switchCaseTemplateBody : lp.SwitchCaseTemplateBodyContext = context.switchCaseTemplateBody()
        const switchNode : lp.SwitchStatementContext = switchCaseTemplateBody.switchStatement();
        const caseRuleNodes : lp.CaseConditionRuleContext[] = switchCaseTemplateBody.caseConditionRule();
        const defaultNode : lp.DefaultConditionRuleContext = switchCaseTemplateBody.defaultConditionRule();

        if (switchNode.EXPRESSION.length !== 1){
            result.push(this.BuildLGDiagnostic({
                message: `Switch statement should be followed by one valid expression: '${switchNode.text}'`,
                context: switchNode
            }));
        } else {
            result = result.concat(this.CheckExpression(switchNode.EXPRESSION[0].text, switchNode));
        }

        for (const caseRuleNode of caseRuleNodes) {
            if (caseRuleNode.caseCondition().EXPRESSION.length !== 1) {
                result.push(this.BuildLGDiagnostic({
                    message: `Case statement should be followed by one valid expression: '${caseRuleNode.text}'`,
                    context: caseRuleNode
                }));
            } else {
                result = result.concat(this.CheckExpression(caseRuleNode.caseCondition().EXPRESSION[0].text, caseRuleNode));
            }

            if (caseRuleNode.normalTemplateBody !== undefined){
                result = result.concat(this.visit(caseRuleNode.normalTemplateBody()));
            } else {
                result.push(this.BuildLGDiagnostic({
                    message: `No normal template body in case block: '${caseRuleNode.text}'`,
                    context: caseRuleNode
                }));
            }
        }

        if (defaultNode !== undefined) {
            if (defaultNode.normalTemplateBody !==undefined) {
                result = result.concat(this.visit(defaultNode.normalTemplateBody()));
            } else {
                result.push(this.BuildLGDiagnostic({
                    message: `No normal template body in default block: '${defaultNode.text}'`,
                    context: defaultNode
                }));
            }
        } else {
            result.push(this.BuildLGDiagnostic({
                message: `No normal template body in default block: '${defaultNode.text}'`,
                severity: DiagnosticSeverity.Warning,
                context: defaultNode    
            }));
        }
        return result;
    }


    public visitNormalTemplateString(context: lp.NormalTemplateStringContext): Diagnostic[] {
        let result: Diagnostic[] = [];
        for (const child of context.children) {
            const node: TerminalNode = child as TerminalNode;
            switch (node.symbol.type) {
                case lp.LGFileParser.INVALID_ESCAPE: {
                    result.push(this.BuildLGDiagnostic({
                        message: `escape character ${node.text} is invalid`,
                        context: context
                    }));
                    break;
                }
                case lp.LGFileParser.TEMPLATE_REF: {
                    result = result.concat(this.CheckTemplateRef(node.text, context));
                    break;
                }
                case lp.LGFileParser.EXPRESSION: {
                    result = result.concat(this.CheckExpression(node.text, context));
                    break;
                }
                case lp.LGFileParser.MULTI_LINE_TEXT: {
                    result = result.concat(this.CheckMultiLineText(node.text, context));
                    break;
                }
                case lp.LGFileParser.TEXT: {
                    result = result.concat(this.CheckText(node.text, context));
                    break;
                }
                default:
                    break;
            }
        }

        return result;
    }

    protected defaultResult(): Diagnostic[] {
        return [];
    }

    private CheckTemplateRef(exp: string, context: ParserRuleContext): Diagnostic[] {
        let result: Diagnostic[] = [];
        exp = exp.replace(/(^\[*)/g, '')
                .replace(/(\]*$)/g, '')
                .trim();

        const argsStartPos: number = exp.indexOf('(');
        if (argsStartPos > 0) {
            const argsEndPos: number = exp.lastIndexOf(')');
            if (argsEndPos < 0 || argsEndPos < argsStartPos + 1) {
                result.push(this.BuildLGDiagnostic({
                    message: `Not a valid template ref: ${exp}`,
                    context: context
                }));
            } else {
                 const templateName: string = exp.substr(0, argsStartPos);
                 if (!(templateName in this.TemplateMap)) {
                     result.push(this.BuildLGDiagnostic({
                         message: `[${templateName}] template not found`,
                         context: context
                     }));
                 } else {
                    const argsNumber: number = exp.substr(argsStartPos + 1, argsEndPos - argsStartPos - 1).split(',').length;
                    result = result.concat(this.CheckTemplateParameters(templateName, argsNumber, context));
                 }
            }
        } else {
            if (!(exp in this.TemplateMap)) {
                result.push(this.BuildLGDiagnostic({
                    message: `[${exp}] template not found`,
                    context: context
                }));
            }
        }

        return result;
    }

    private CheckMultiLineText(exp: string, context: ParserRuleContext): Diagnostic[] {
        let result: Diagnostic[] = [];
        exp = exp.substr(3, exp.length - 6);
        const matches: string[] = exp.match(/@\{[^{}]+\}/g);
        if (matches !== null && matches !== undefined) {
            for (const match of matches) {
                const newExp: string = match.substr(1);
                result = result.concat(this.CheckExpression(newExp, context));
            }
        }

        return result;
    }

    private CheckText(exp: string, context: ParserRuleContext): Diagnostic[] {
        const result: Diagnostic[] = [];

        if (exp.startsWith('```')) {
            result.push(this.BuildLGDiagnostic({
                message: 'Multi line variation must be enclosed in ```',
                context: context
            }));
        }

        return result;
    }

    private CheckTemplateParameters(templateName: string, argsNumber: number, context: ParserRuleContext): Diagnostic[] {
        const result: Diagnostic[] = [];
        const parametersNumber: number = this.TemplateMap[templateName].Parameters.length;

        if (argsNumber !== parametersNumber) {
            result.push(this.BuildLGDiagnostic({
                message: `Arguments count mismatch for template ref ${templateName}, expected ${parametersNumber}, actual ${argsNumber}`,
                context: context
            }));
        }

        return result;
    }

    private CheckExpression(exp: string, context: ParserRuleContext): Diagnostic[] {
        const result: Diagnostic[] = [];
        exp = exp.replace(/(^{*)/g, '')
                .replace(/(}*$)/g, '')
                .trim();

        try {
            new ExpressionEngine(new GetMethodExtensions(new Evaluator(this.Templates, undefined)).GetMethodX).parse(exp);
        } catch (e) {
            result.push(this.BuildLGDiagnostic({
                message: e.message.concat(` in expression '${exp}'`),
                context: context
            }));

            return result;
        }

        return result;
    }

    private BuildLGDiagnostic(parameters: { message: string; severity?: DiagnosticSeverity; context?: ParserRuleContext }): Diagnostic {
        const message: string = parameters.message;
        const severity: DiagnosticSeverity = parameters.severity === undefined ? DiagnosticSeverity.Error : parameters.severity;
        const context: ParserRuleContext = parameters.context;
        // tslint:disable-next-line: max-line-length
        const startPosition: Position = context === undefined ? new Position(0, 0) : new Position(context.start.line - 1, context.start.charPositionInLine);
        // tslint:disable-next-line: max-line-length
        const stopPosition: Position = context === undefined ? new Position(0, 0) : new Position(context.stop.line - 1, context.stop.charPositionInLine);
        const range: Range = new Range(startPosition, stopPosition);

        return new Diagnostic(range, message, severity);
    }
}
