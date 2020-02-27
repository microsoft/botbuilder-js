/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line: no-submodule-imports
import { ParserRuleContext } from 'antlr4ts';
import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import { ExpressionEngine, ExpressionParserInterface } from 'adaptive-expressions';
import { Diagnostic, DiagnosticSeverity } from './diagnostic';
import { Evaluator } from './evaluator';
import * as lp from './generated/LGFileParser';
import { LGFileParserVisitor } from './generated/LGFileParserVisitor';
import { LGFile } from './lgFile';
import { LGErrors } from './lgErrors';
import { Position } from './position';
import { Range } from './range';
import { LGExtensions } from './lgExtensions';

/// <summary>
/// LG managed code checker.
/// </summary>
export class StaticChecker extends AbstractParseTreeVisitor<Diagnostic[]> implements LGFileParserVisitor<Diagnostic[]> {
    private readonly baseExpressionEngine: ExpressionEngine;
    private readonly lgFile: LGFile;
    private visitedTemplateNames: string[];
    private _expressionParser: ExpressionParserInterface;

    public constructor(lgFile: LGFile, expressionEngine: ExpressionEngine = undefined) {
        super();
        this.lgFile = lgFile;
        this.baseExpressionEngine = expressionEngine || new ExpressionEngine();
    }

    // Create a property because we want this to be lazy loaded
    private get expressionParser(): ExpressionParserInterface {
        if (this._expressionParser === undefined) {
            // create an evaluator to leverage it's customized function look up for checking
            var evaluator = new Evaluator(this.lgFile.allTemplates, this.baseExpressionEngine);
            this._expressionParser = evaluator.expressionEngine;
        }

        return this._expressionParser;
    }

    /// <summary>
    /// Return error messages list.
    /// </summary>
    /// <returns>report result.</returns>
    public check(): Diagnostic[] {
        this.visitedTemplateNames = [];
        var result = [];

        if (this.lgFile.allTemplates.length === 0)
        {
            result.push(this.buildLGDiagnostic(LGErrors.noTemplate, DiagnosticSeverity.Warning, undefined, false));

            return result;
        }

        this.lgFile.templates.forEach(t => result = result.concat(this.visit(t.parseTree)));
        return result;
    }

    public visitTemplateDefinition(context: lp.TemplateDefinitionContext): Diagnostic[]
    {
        var result = [];
        var templateNameLine = context.templateNameLine();
        var errorTemplateName = templateNameLine.errorTemplateName();
        if (errorTemplateName)
        {
            result.push(this.buildLGDiagnostic(LGErrors.invalidTemplateName, undefined, errorTemplateName, false));
        }
        else {
            var templateName = context.templateNameLine().templateName().text;

            if (this.visitedTemplateNames.includes(templateName))
            {
                result.push(this.buildLGDiagnostic(LGErrors.duplicatedTemplateInSameTemplate(templateName),undefined, templateNameLine));
            }
            else {
                this.visitedTemplateNames.push(templateName);
                for (const reference of this.lgFile.references)
                {
                    var sameTemplates = reference.templates.filter(u => u.name === templateName);
                    for(const sameTemplate of sameTemplates)
                    {
                        result.push(this.buildLGDiagnostic( LGErrors.duplicatedTemplateInDiffTemplate(sameTemplate.name, sameTemplate.source), undefined, templateNameLine));
                    }
                }

                if (result.length > 0) {
                    return result;
                }
                else
                {
                    if (!context.templateBody())
                    {
                        result.push(this.buildLGDiagnostic(LGErrors.noTemplateBody(templateName), DiagnosticSeverity.Warning, context.templateNameLine()));
                    }
                    else {
                        result = result.concat(this.visit(context.templateBody()));
                    }
                }
            }
        }

        return result;
    }

    public visitNormalTemplateBody(context: lp.NormalTemplateBodyContext): Diagnostic[] {
        let result: Diagnostic[] = [];
        for (const templateStr of context.templateString()) {
            const errorTemplateStr: lp.ErrorTemplateStringContext = templateStr.errorTemplateString();

            if (errorTemplateStr) {
                result.push(this.buildLGDiagnostic(LGErrors.invalidTemplateBody, undefined, errorTemplateStr));
            } else {
                result = result.concat(this.visit(templateStr));
            }
        }

        return result;
    }

    public visitStructuredTemplateBody(context: lp.StructuredTemplateBodyContext): Diagnostic[] {
        let result: Diagnostic[] = [];

        if (context.structuredBodyNameLine().errorStructuredName() !== undefined) {
            result.push(this.buildLGDiagnostic(LGErrors.invalidStrucName, undefined, context.structuredBodyNameLine()));
        }

        if (context.structuredBodyEndLine() === undefined) {
            result.push(this.buildLGDiagnostic(LGErrors.missingStrucEnd, undefined, context));
        }

        const bodys = context.structuredBodyContentLine();
        if (!bodys || bodys.length === 0) {
            result.push(this.buildLGDiagnostic(LGErrors.emptyStrucContent, undefined, context));
        } else {
            for (const body of bodys) {
                if (body.errorStructureLine() !== undefined) {
                    result.push(this.buildLGDiagnostic(LGErrors.invalidStrucBody, undefined, body.errorStructureLine()));
                } else if (body.objectStructureLine() !== undefined) {
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
                result.push(this.buildLGDiagnostic(LGErrors.invalidWhitespaceInCondition, undefined, conditionNode));
            }

            if (idx === 0 && !ifExpr) {
                result.push(this.buildLGDiagnostic(LGErrors.notStartWithIfInCondition, DiagnosticSeverity.Warning, conditionNode));
            }

            if (idx > 0 && ifExpr) {
                result.push(this.buildLGDiagnostic(LGErrors.multipleIfInCondition, undefined, conditionNode));
            }

            if (idx === ifRules.length - 1 && !elseExpr) {
                result.push(this.buildLGDiagnostic(LGErrors.notEndWithElseInCondition, DiagnosticSeverity.Warning, conditionNode));
            }

            if (idx > 0 && idx < ifRules.length - 1 && !elseIfExpr) {
                result.push(this.buildLGDiagnostic(LGErrors.invalidMiddleInCondition, undefined, conditionNode));
            }

            if (!elseExpr) {
                if (ifRule.ifCondition().EXPRESSION().length !== 1) {
                    result.push(this.buildLGDiagnostic(LGErrors.invalidExpressionInCondition,undefined, conditionNode));
                } else {
                    const errorPrefix =  `Condition '` + conditionNode.EXPRESSION(0).text + `': `;
                    result = result.concat(this.checkExpression(ifRule.ifCondition().EXPRESSION(0).text, conditionNode, errorPrefix));
                }
            } else {
                if (ifRule.ifCondition().EXPRESSION().length !== 0) {
                    result.push(this.buildLGDiagnostic(LGErrors.extraExpressionInCondition, undefined, conditionNode));
                }
            }
            if (ifRule.normalTemplateBody() !== undefined) {
                result = result.concat(this.visit(ifRule.normalTemplateBody()));
            } else {
                result.push(this.buildLGDiagnostic(LGErrors.missingTemplateBodyInCondition, undefined, conditionNode));
            }

            idx = idx + 1;
        }

        return result;
    }

    // tslint:disable-next-line: cyclomatic-complexity
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
                result.push(this.buildLGDiagnostic(LGErrors.invalidWhitespaceInSwitchCase, undefined, switchCaseStat));
            }

            if (idx === 0 && !switchExpr) {
                result.push(this.buildLGDiagnostic(LGErrors.notStartWithSwitchInSwitchCase, undefined, switchCaseStat));
            }

            if (idx > 0 && switchExpr) {
                result.push(this.buildLGDiagnostic(LGErrors.multipleSwithStatementInSwitchCase, undefined, switchCaseStat));
            }

            if (idx > 0 && idx < length - 1 && !caseExpr) {
                result.push(this.buildLGDiagnostic(LGErrors.invalidStatementInMiddlerOfSwitchCase, undefined, switchCaseStat));
            }

            if (idx === length - 1 && (caseExpr || defaultExpr)) {
                if (caseExpr) {
                    result.push(this.buildLGDiagnostic(LGErrors.notEndWithDefaultInSwitchCase, DiagnosticSeverity.Warning, switchCaseStat));
                } else {
                    if (length === 2) {
                        result.push(this.buildLGDiagnostic(LGErrors.missingCaseInSwitchCase, DiagnosticSeverity.Warning, switchCaseStat));
                    }
                }
            }
            if (switchExpr || caseExpr) {
                if (switchCaseStat.EXPRESSION().length !== 1) {
                    result.push(this.buildLGDiagnostic(LGErrors.invalidExpressionInSwiathCase, undefined, switchCaseStat));
                } else {
                    let errorPrefix = switchExpr? `Switch` : `Case`;
                    errorPrefix += ` '` + switchCaseStat.EXPRESSION(0).text + `': `;
                    result = result.concat(this.checkExpression(switchCaseStat.EXPRESSION(0).text, switchCaseStat, errorPrefix));
                }
            } else {
                if (switchCaseStat.EXPRESSION().length !== 0 || switchCaseStat.TEXT().length !== 0) {
                    result.push(this.buildLGDiagnostic(LGErrors.extraExpressionInSwitchCase, undefined, switchCaseStat));
                }
            }
            if (caseExpr || defaultExpr) {
                if (iterNode.normalTemplateBody()) {
                    result = result.concat(this.visit(iterNode.normalTemplateBody()));
                } else {
                    result.push(this.buildLGDiagnostic(LGErrors.missingTemplateBodyInSwitchCase, undefined, switchCaseStat));
                }
            }
            idx = idx + 1;
        }

        return result;
    }

    public visitNormalTemplateString(context: lp.NormalTemplateStringContext): Diagnostic[] {
        const prefixErrorMsg = LGExtensions.getPrefixErrorMessage(context);
        let result: Diagnostic[] = [];

        for (const expression of context.EXPRESSION()) {
            result = result.concat(this.checkExpression(expression.text, context, prefixErrorMsg));
        }

        const multiLinePrefix = context.MULTILINE_PREFIX();
        const multiLineSuffix = context.MULTILINE_SUFFIX();
        
        if (multiLinePrefix !== undefined &&  multiLineSuffix === undefined) {
            result.push(this.buildLGDiagnostic(LGErrors.noEndingInMultiline, undefined, context));
        }
        return result;
    }

    protected defaultResult(): Diagnostic[] {
        return [];
    }

    private checkExpression(exp: string, context: ParserRuleContext, prefix: string = ''): Diagnostic[] {
        const result: Diagnostic[] = [];
        if(!exp.endsWith('}')) {
            result.push(this.buildLGDiagnostic(LGErrors.noCloseBracket, undefined, context));
        } else {
            exp = LGExtensions.trimExpression(exp);

            try {
                this.expressionParser.parse(exp);
            } catch (e) {
                const errorMsg = prefix + LGErrors.expressionParseError(exp) + e.message;
                result.push(this.buildLGDiagnostic(errorMsg, undefined, context));
    
                return result;
            }
        }

        return result;
    }

    private buildLGDiagnostic( message: string, severity: DiagnosticSeverity = undefined, context: ParserRuleContext = undefined, includeTemplateNameInfo: boolean = true): Diagnostic {
        const startPosition = context === undefined ? new Position(0, 0) : new Position(context.start.line, context.start.charPositionInLine);
        const stopPosition = context === undefined ? new Position(0, 0) : new Position(context.stop.line, context.stop.charPositionInLine + context.stop.text.length);
        severity = severity? severity : DiagnosticSeverity.Error;
        const range = new Range(startPosition, stopPosition);
        message = (this.visitedTemplateNames.length > 0 && includeTemplateNameInfo)? `[${ this.visitedTemplateNames.reverse().find(x => true) }]`+ message : message;
        
        return new Diagnostic(range, message, severity, this.lgFile.id);
    }
}
