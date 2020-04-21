/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ParserRuleContext } from 'antlr4ts';
import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import { ExpressionParser, ExpressionParserInterface } from 'adaptive-expressions';
import { Diagnostic, DiagnosticSeverity } from './diagnostic';
import { Evaluator } from './evaluator';
import * as lp from './generated/LGTemplateParser';
import { LGTemplateParserVisitor } from './generated/LGTemplateParserVisitor';
import { Templates } from './templates';
import { TemplateErrors } from './templateErrors';
import { Range } from './range';
import { TemplateExtensions } from './templateExtensions';
import { Template } from './template';

/**
 * LG managed code checker.
 */
export class StaticChecker extends AbstractParseTreeVisitor<Diagnostic[]> implements LGTemplateParserVisitor<Diagnostic[]> {
    private readonly baseExpressionParser: ExpressionParser;
    private readonly templates: Templates;
    private currentTemplate: Template;
    private _expressionParser: ExpressionParserInterface;

    public constructor(templates: Templates) {
        super();
        this.templates = templates;
        this.baseExpressionParser = templates.expressionParser || new ExpressionParser();
    }

    // Create a property because we want this to be lazy loaded
    private get expressionParser(): ExpressionParserInterface {
        if (this._expressionParser === undefined) {
            // create an evaluator to leverage it's customized function look up for checking
            var evaluator = new Evaluator(this.templates.allTemplates, this.baseExpressionParser);
            this._expressionParser = evaluator.expressionParser;
        }

        return this._expressionParser;
    }

    /**
     * Return error messages list.
     * @returns Report result.
     */
    public check(): Diagnostic[] {
        var result: Diagnostic[] = [];

        if (this.templates.allTemplates.length === 0)
        {
            const diagnostic = new Diagnostic(Range.DefaultRange, TemplateErrors.noTemplate, DiagnosticSeverity.Warning, this.templates.id);
            result.push(diagnostic);
            return result;
        }

        for (const template of this.templates) {
            this.currentTemplate = template;
            let templateDiagnostics: Diagnostic[] = [];

            for (const reference of this.templates.references) {
                var sameTemplates = reference.toArray().filter((u): boolean => u.name === template.name);
                for(const sameTemplate of sameTemplates) {
                    const startLine = template.sourceRange.range.start.line;
                    const range = new Range(startLine, 0, startLine, template.name.length + 1);
                    const diagnostic = new Diagnostic(range, TemplateErrors.duplicatedTemplateInDiffTemplate(sameTemplate.name, sameTemplate.sourceRange.source), DiagnosticSeverity.Error, this.templates.id);
                    templateDiagnostics.push(diagnostic);
                }
            }

            if (templateDiagnostics.length === 0 && template.templateBodyParseTree !== undefined) {
                templateDiagnostics.push(...this.visit(template.templateBodyParseTree));
            }

            result.push(...templateDiagnostics);
        }

        return result;
    }

    public visitNormalTemplateBody(context: lp.NormalTemplateBodyContext): Diagnostic[] {
        let result: Diagnostic[] = [];
        for (const templateStr of context.templateString()) {
            const errorTemplateStr: lp.ErrorTemplateStringContext = templateStr.errorTemplateString();

            if (errorTemplateStr) {
                result.push(this.buildLGDiagnostic(TemplateErrors.invalidTemplateBody, undefined, errorTemplateStr));
            } else {
                result = result.concat(this.visit(templateStr));
            }
        }

        return result;
    }

    public visitStructuredTemplateBody(context: lp.StructuredTemplateBodyContext): Diagnostic[] {
        let result: Diagnostic[] = [];

        if (context.structuredBodyNameLine().errorStructuredName() !== undefined) {
            result.push(this.buildLGDiagnostic(TemplateErrors.invalidStrucName, undefined, context.structuredBodyNameLine()));
        }

        if (context.structuredBodyEndLine() === undefined) {
            result.push(this.buildLGDiagnostic(TemplateErrors.missingStrucEnd, undefined, context));
        }

        const errors = context.errorStructureLine();
        if (errors && errors.length > 0){
            for (const error of errors) {
                result.push(this.buildLGDiagnostic(TemplateErrors.invalidStrucBody, undefined, error));
            }
        } else {
            const bodys = context.structuredBodyContentLine();
            if (!bodys || bodys.length === 0) {
                result.push(this.buildLGDiagnostic(TemplateErrors.emptyStrucContent, undefined, context));
            } else {
                for (const body of bodys) {
                    if (body.objectStructureLine() !== undefined) {
                        result = result.concat(this.checkExpression(body.objectStructureLine().text, body.objectStructureLine()));
                    } else {
                        const structureValues = body.keyValueStructureLine().keyValueStructureValue();
                        const errorPrefix = `Property  '` + body.keyValueStructureLine().text + `':`;
                        for (const structureValue of structureValues) {
                            for (const expr of structureValue.EXPRESSION_IN_STRUCTURE_BODY()) {
                                result = result.concat(this.checkExpression(expr.text, structureValue, errorPrefix));
                            }
                        }
                    }
                }
            }
        }


        return result;
    }

    public visitIfElseBody(context: lp.IfElseBodyContext): Diagnostic[] {
        let result: Diagnostic[] = [];
        const ifRules: lp.IfConditionRuleContext[] = context.ifElseTemplateBody().ifConditionRule();

        let idx = 0;
        for (const ifRule of ifRules) {
            const conditionNode: lp.IfConditionContext = ifRule.ifCondition();
            const ifExpr: boolean = conditionNode.IF() !== undefined;
            const elseIfExpr: boolean = conditionNode.ELSEIF() !== undefined;
            const elseExpr: boolean = conditionNode.ELSE() !== undefined;

            const node: TerminalNode = ifExpr ? conditionNode.IF() :
                elseIfExpr ? conditionNode.ELSEIF() :
                    conditionNode.ELSE();

            if (node.text.split(' ').length - 1 > 1) {
                result.push(this.buildLGDiagnostic(TemplateErrors.invalidWhitespaceInCondition, undefined, conditionNode));
            }

            if (idx === 0 && !ifExpr) {
                result.push(this.buildLGDiagnostic(TemplateErrors.notStartWithIfInCondition, DiagnosticSeverity.Warning, conditionNode));
            }

            if (idx > 0 && ifExpr) {
                result.push(this.buildLGDiagnostic(TemplateErrors.multipleIfInCondition, undefined, conditionNode));
            }

            if (idx === ifRules.length - 1 && !elseExpr) {
                result.push(this.buildLGDiagnostic(TemplateErrors.notEndWithElseInCondition, DiagnosticSeverity.Warning, conditionNode));
            }

            if (idx > 0 && idx < ifRules.length - 1 && !elseIfExpr) {
                result.push(this.buildLGDiagnostic(TemplateErrors.invalidMiddleInCondition, undefined, conditionNode));
            }

            if (!elseExpr) {
                if (ifRule.ifCondition().EXPRESSION().length !== 1) {
                    result.push(this.buildLGDiagnostic(TemplateErrors.invalidExpressionInCondition,undefined, conditionNode));
                } else {
                    const errorPrefix =  `Condition '` + conditionNode.EXPRESSION(0).text + `': `;
                    result = result.concat(this.checkExpression(ifRule.ifCondition().EXPRESSION(0).text, conditionNode, errorPrefix));
                }
            } else {
                if (ifRule.ifCondition().EXPRESSION().length !== 0) {
                    result.push(this.buildLGDiagnostic(TemplateErrors.extraExpressionInCondition, undefined, conditionNode));
                }
            }
            if (ifRule.normalTemplateBody() !== undefined) {
                result = result.concat(this.visit(ifRule.normalTemplateBody()));
            } else {
                result.push(this.buildLGDiagnostic(TemplateErrors.missingTemplateBodyInCondition, undefined, conditionNode));
            }

            idx = idx + 1;
        }

        return result;
    }

    public visitSwitchCaseBody(context: lp.SwitchCaseBodyContext): Diagnostic[] {
        let result: Diagnostic[] = [];
        const switchCaseNodes: lp.SwitchCaseRuleContext[] = context.switchCaseTemplateBody().switchCaseRule();
        let idx = 0;
        const length: number = switchCaseNodes.length;

        for (const iterNode of switchCaseNodes) {
            const switchCaseStat: lp.SwitchCaseStatContext = iterNode.switchCaseStat();
            const switchExpr: boolean = switchCaseStat.SWITCH() !== undefined;
            const caseExpr: boolean = switchCaseStat.CASE() !== undefined;
            const defaultExpr: boolean = switchCaseStat.DEFAULT() !== undefined;
            const node: TerminalNode = switchExpr ? switchCaseStat.SWITCH() :
                caseExpr ? switchCaseStat.CASE() :
                    switchCaseStat.DEFAULT();
            if (node.text.split(' ').length - 1 > 1) {
                result.push(this.buildLGDiagnostic(TemplateErrors.invalidWhitespaceInSwitchCase, undefined, switchCaseStat));
            }

            if (idx === 0 && !switchExpr) {
                result.push(this.buildLGDiagnostic(TemplateErrors.notStartWithSwitchInSwitchCase, undefined, switchCaseStat));
            }

            if (idx > 0 && switchExpr) {
                result.push(this.buildLGDiagnostic(TemplateErrors.multipleSwithStatementInSwitchCase, undefined, switchCaseStat));
            }

            if (idx > 0 && idx < length - 1 && !caseExpr) {
                result.push(this.buildLGDiagnostic(TemplateErrors.invalidStatementInMiddlerOfSwitchCase, undefined, switchCaseStat));
            }

            if (idx === length - 1 && (caseExpr || defaultExpr)) {
                if (caseExpr) {
                    result.push(this.buildLGDiagnostic(TemplateErrors.notEndWithDefaultInSwitchCase, DiagnosticSeverity.Warning, switchCaseStat));
                } else {
                    if (length === 2) {
                        result.push(this.buildLGDiagnostic(TemplateErrors.missingCaseInSwitchCase, DiagnosticSeverity.Warning, switchCaseStat));
                    }
                }
            }
            if (switchExpr || caseExpr) {
                if (switchCaseStat.EXPRESSION().length !== 1) {
                    result.push(this.buildLGDiagnostic(TemplateErrors.invalidExpressionInSwiathCase, undefined, switchCaseStat));
                } else {
                    let errorPrefix = switchExpr ? 'Switch' : 'Case';
                    errorPrefix += ` '${ switchCaseStat.EXPRESSION(0).text }': `;
                    result = result.concat(this.checkExpression(switchCaseStat.EXPRESSION(0).text, switchCaseStat, errorPrefix));
                }
            } else {
                if (switchCaseStat.EXPRESSION().length !== 0 || switchCaseStat.TEXT().length !== 0) {
                    result.push(this.buildLGDiagnostic(TemplateErrors.extraExpressionInSwitchCase, undefined, switchCaseStat));
                }
            }
            if (caseExpr || defaultExpr) {
                if (iterNode.normalTemplateBody()) {
                    result = result.concat(this.visit(iterNode.normalTemplateBody()));
                } else {
                    result.push(this.buildLGDiagnostic(TemplateErrors.missingTemplateBodyInSwitchCase, undefined, switchCaseStat));
                }
            }
            idx = idx + 1;
        }

        return result;
    }

    public visitNormalTemplateString(context: lp.NormalTemplateStringContext): Diagnostic[] {
        const prefixErrorMsg = TemplateExtensions.getPrefixErrorMessage(context);
        let result: Diagnostic[] = [];

        for (const expression of context.EXPRESSION()) {
            result = result.concat(this.checkExpression(expression.text, context, prefixErrorMsg));
        }

        const multiLinePrefix = context.MULTILINE_PREFIX();
        const multiLineSuffix = context.MULTILINE_SUFFIX();
        
        if (multiLinePrefix !== undefined &&  multiLineSuffix === undefined) {
            result.push(this.buildLGDiagnostic(TemplateErrors.noEndingInMultiline, undefined, context));
        }
        return result;
    }

    protected defaultResult(): Diagnostic[] {
        return [];
    }

    private checkExpression(exp: string, context: ParserRuleContext, prefix: string = ''): Diagnostic[] {
        const result: Diagnostic[] = [];
        if(!exp.endsWith('}')) {
            result.push(this.buildLGDiagnostic(TemplateErrors.noCloseBracket, undefined, context));
        } else {
            exp = TemplateExtensions.trimExpression(exp);

            try {
                this.expressionParser.parse(exp);
            } catch (e) {
                const suffixErrorMsg = Evaluator.concatErrorMsg(TemplateErrors.expressionParseError(exp), e.message);
                const errorMsg = Evaluator.concatErrorMsg(prefix, suffixErrorMsg);
                result.push(this.buildLGDiagnostic(errorMsg, undefined, context));
    
                return result;
            }
        }

        return result;
    }

    private buildLGDiagnostic( message: string, severity: DiagnosticSeverity = undefined, context: ParserRuleContext = undefined): Diagnostic {
        const lineOffset = this.currentTemplate !== undefined ? this.currentTemplate.sourceRange.range.start.line : 0;
        message = this.currentTemplate !== undefined ? `[${ this.currentTemplate.name }]` + message : message;
        const range = context === undefined ? new Range(lineOffset + 1, 0, lineOffset + 1, 0) : TemplateExtensions.convertToRange(context, lineOffset);
        return new Diagnostic(range, message, severity, this.templates.id);
    }
}
