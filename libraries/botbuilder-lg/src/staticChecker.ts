/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import { Diagnostic, DiagnosticSeverity } from './diagnostic';
import { Evaluator } from './evaluator';
import { ExpressionParserInterface } from 'adaptive-expressions';
import { LGTemplateParserVisitor } from './generated/LGTemplateParserVisitor';
import { ParserRuleContext } from 'antlr4ts';
import { Range } from './range';
import { Template } from './template';
import { TemplateErrors } from './templateErrors';
import { TemplateExtensions } from './templateExtensions';
import { Templates } from './templates';

import {
    ErrorTemplateStringContext,
    IfConditionContext,
    IfConditionRuleContext,
    IfElseBodyContext,
    NormalTemplateBodyContext,
    NormalTemplateStringContext,
    StructuredTemplateBodyContext,
    SwitchCaseBodyContext,
    SwitchCaseRuleContext,
    SwitchCaseStatContext,
} from './generated/LGTemplateParser';

/**
 * LG managed code checker.
 */
export class StaticChecker
    extends AbstractParseTreeVisitor<Diagnostic[]>
    implements LGTemplateParserVisitor<Diagnostic[]> {
    private readonly templates: Templates;
    private currentTemplate: Template;
    private _expressionParser: ExpressionParserInterface;

    /**
     * Creates a new instance of the [StaticChecker](xref:botbuilder-lg.StaticChecker) class.
     *
     * @param templates [Templates](xref:botbuilder-lg.Templates) to be checked.
     */
    constructor(templates: Templates) {
        super();
        this.templates = templates;
    }

    /**
     * @private
     * Creates a property because we want this to be lazy loaded.
     */
    private get expressionParser(): ExpressionParserInterface {
        if (this._expressionParser === undefined) {
            // create an evaluator to leverage it's customized function look up for checking
            const evaluator = new Evaluator(this.templates, this.templates.lgOptions);
            this._expressionParser = evaluator.expressionParser;
        }

        return this._expressionParser;
    }

    /**
     * Return error messages list.
     *
     * @returns Report result.
     */
    check(): Diagnostic[] {
        const result: Diagnostic[] = [];

        if (this.templates.allTemplates.length === 0) {
            const diagnostic = new Diagnostic(
                Range.DefaultRange,
                TemplateErrors.noTemplate,
                DiagnosticSeverity.Warning,
                this.templates.source
            );
            result.push(diagnostic);
            return result;
        }

        for (const template of this.templates) {
            this.currentTemplate = template;
            const templateDiagnostics: Diagnostic[] = [];

            for (const reference of this.templates.references) {
                const sameTemplates = reference.toArray().filter((u): boolean => u.name === template.name);
                for (const sameTemplate of sameTemplates) {
                    const startLine = template.sourceRange.range.start.line;
                    const range = new Range(startLine, 0, startLine, template.name.length + 1);
                    const diagnostic = new Diagnostic(
                        range,
                        TemplateErrors.duplicatedTemplateInDiffTemplate(
                            sameTemplate.name,
                            sameTemplate.sourceRange.source
                        ),
                        DiagnosticSeverity.Error,
                        this.templates.source
                    );
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

    /**
     * Visit a parse tree produced by `LGTemplateParser.normalTemplateBody`.
     *
     * @param context The parse tree.
     * @returns The result of visiting normal template body.
     */
    visitNormalTemplateBody(context: NormalTemplateBodyContext): Diagnostic[] {
        let result: Diagnostic[] = [];
        for (const templateStr of context.templateString()) {
            const errorTemplateStr: ErrorTemplateStringContext = templateStr.errorTemplateString();

            if (errorTemplateStr) {
                result.push(this.buildLGDiagnostic(TemplateErrors.invalidTemplateBody, undefined, errorTemplateStr));
            } else {
                result = result.concat(this.visit(templateStr));
            }
        }

        return result;
    }

    /**
     * Visit a parse tree produced by `LGTemplateParser.structuredTemplateBody`.
     *
     * @param context The parse tree.
     * @returns The result of visiting structured template body.
     */
    visitStructuredTemplateBody(context: StructuredTemplateBodyContext): Diagnostic[] {
        let result: Diagnostic[] = [];

        const errorName = context.structuredBodyNameLine().errorStructuredName();
        if (errorName !== undefined) {
            result.push(
                this.buildLGDiagnostic(
                    TemplateErrors.invalidStrucName(errorName.text),
                    undefined,
                    context.structuredBodyNameLine()
                )
            );
        }

        if (context.structuredBodyEndLine() === undefined) {
            result.push(this.buildLGDiagnostic(TemplateErrors.missingStrucEnd, undefined, context));
        }

        const errors = context.errorStructureLine();
        if (errors && errors.length > 0) {
            for (const error of errors) {
                result.push(this.buildLGDiagnostic(TemplateErrors.invalidStrucBody(error.text), undefined, error));
            }
        } else {
            const bodys = context.structuredBodyContentLine();
            if (!bodys || bodys.length === 0) {
                result.push(this.buildLGDiagnostic(TemplateErrors.emptyStrucContent, undefined, context));
            } else {
                for (const body of bodys) {
                    if (body.expressionInStructure() !== undefined) {
                        result = result.concat(this.checkExpression(body.expressionInStructure()));
                    } else {
                        const structureValues = body.keyValueStructureLine().keyValueStructureValue();
                        const errorPrefix = "Property  '" + body.keyValueStructureLine().text + "':";
                        for (const structureValue of structureValues) {
                            for (const expr of structureValue.expressionInStructure()) {
                                result = result.concat(this.checkExpression(expr, errorPrefix));
                            }
                        }
                    }
                }
            }
        }

        return result;
    }

    /**
     * Visit a parse tree produced by the `ifElseBody` labeled alternative in `LGTemplateParser.body`.
     *
     * @param context The parse tree.
     * @returns The result of visiting if-else body.
     */
    visitIfElseBody(context: IfElseBodyContext): Diagnostic[] {
        let result: Diagnostic[] = [];
        const ifRules: IfConditionRuleContext[] = context.ifElseTemplateBody().ifConditionRule();

        let idx = 0;
        for (const ifRule of ifRules) {
            const conditionNode: IfConditionContext = ifRule.ifCondition();
            const ifExpr: boolean = conditionNode.IF() !== undefined;
            const elseIfExpr: boolean = conditionNode.ELSEIF() !== undefined;
            const elseExpr: boolean = conditionNode.ELSE() !== undefined;

            const node: TerminalNode = ifExpr
                ? conditionNode.IF()
                : elseIfExpr
                ? conditionNode.ELSEIF()
                : conditionNode.ELSE();

            if (node.text.split(' ').length - 1 > 1) {
                result.push(
                    this.buildLGDiagnostic(TemplateErrors.invalidWhitespaceInCondition, undefined, conditionNode)
                );
            }

            if (idx === 0 && !ifExpr) {
                result.push(
                    this.buildLGDiagnostic(
                        TemplateErrors.notStartWithIfInCondition,
                        DiagnosticSeverity.Warning,
                        conditionNode
                    )
                );
            }

            if (idx > 0 && ifExpr) {
                result.push(this.buildLGDiagnostic(TemplateErrors.multipleIfInCondition, undefined, conditionNode));
            }

            if (idx === ifRules.length - 1 && !elseExpr) {
                result.push(
                    this.buildLGDiagnostic(
                        TemplateErrors.notEndWithElseInCondition,
                        DiagnosticSeverity.Warning,
                        conditionNode
                    )
                );
            }

            if (idx > 0 && idx < ifRules.length - 1 && !elseIfExpr) {
                result.push(this.buildLGDiagnostic(TemplateErrors.invalidMiddleInCondition, undefined, conditionNode));
            }

            if (!elseExpr) {
                if (ifRule.ifCondition().expression().length !== 1) {
                    result.push(
                        this.buildLGDiagnostic(TemplateErrors.invalidExpressionInCondition, undefined, conditionNode)
                    );
                } else {
                    const errorPrefix = "Condition '" + conditionNode.expression(0).text + "': ";
                    result = result.concat(this.checkExpression(conditionNode.expression(0), errorPrefix));
                }
            } else {
                if (ifRule.ifCondition().expression().length !== 0) {
                    result.push(
                        this.buildLGDiagnostic(TemplateErrors.extraExpressionInCondition, undefined, conditionNode)
                    );
                }
            }
            if (ifRule.normalTemplateBody() !== undefined) {
                result = result.concat(this.visit(ifRule.normalTemplateBody()));
            } else {
                result.push(
                    this.buildLGDiagnostic(TemplateErrors.missingTemplateBodyInCondition, undefined, conditionNode)
                );
            }

            idx = idx + 1;
        }

        return result;
    }

    /**
     * Visit a parse tree produced by the `switchCaseBody` labeled alternative in `LGTemplateParser.body`.
     *
     * @param context The parse tree.
     * @returns The result of visiting switch-case body.
     */
    visitSwitchCaseBody(context: SwitchCaseBodyContext): Diagnostic[] {
        let result: Diagnostic[] = [];
        const switchCaseNodes: SwitchCaseRuleContext[] = context.switchCaseTemplateBody().switchCaseRule();
        let idx = 0;
        const length: number = switchCaseNodes.length;

        for (const iterNode of switchCaseNodes) {
            const switchCaseStat: SwitchCaseStatContext = iterNode.switchCaseStat();
            const switchExpr: boolean = switchCaseStat.SWITCH() !== undefined;
            const caseExpr: boolean = switchCaseStat.CASE() !== undefined;
            const defaultExpr: boolean = switchCaseStat.DEFAULT() !== undefined;
            const node: TerminalNode = switchExpr
                ? switchCaseStat.SWITCH()
                : caseExpr
                ? switchCaseStat.CASE()
                : switchCaseStat.DEFAULT();
            if (node.text.split(' ').length - 1 > 1) {
                result.push(
                    this.buildLGDiagnostic(TemplateErrors.invalidWhitespaceInSwitchCase, undefined, switchCaseStat)
                );
            }

            if (idx === 0 && !switchExpr) {
                result.push(
                    this.buildLGDiagnostic(TemplateErrors.notStartWithSwitchInSwitchCase, undefined, switchCaseStat)
                );
            }

            if (idx > 0 && switchExpr) {
                result.push(
                    this.buildLGDiagnostic(TemplateErrors.multipleSwithStatementInSwitchCase, undefined, switchCaseStat)
                );
            }

            if (idx > 0 && idx < length - 1 && !caseExpr) {
                result.push(
                    this.buildLGDiagnostic(
                        TemplateErrors.invalidStatementInMiddlerOfSwitchCase,
                        undefined,
                        switchCaseStat
                    )
                );
            }

            if (idx === length - 1 && (caseExpr || defaultExpr)) {
                if (caseExpr) {
                    result.push(
                        this.buildLGDiagnostic(
                            TemplateErrors.notEndWithDefaultInSwitchCase,
                            DiagnosticSeverity.Warning,
                            switchCaseStat
                        )
                    );
                } else {
                    if (length === 2) {
                        result.push(
                            this.buildLGDiagnostic(
                                TemplateErrors.missingCaseInSwitchCase,
                                DiagnosticSeverity.Warning,
                                switchCaseStat
                            )
                        );
                    }
                }
            }
            if (switchExpr || caseExpr) {
                if (switchCaseStat.expression().length !== 1) {
                    result.push(
                        this.buildLGDiagnostic(TemplateErrors.invalidExpressionInSwiathCase, undefined, switchCaseStat)
                    );
                } else {
                    let errorPrefix = switchExpr ? 'Switch' : 'Case';
                    errorPrefix += ` '${switchCaseStat.expression(0).text}': `;
                    result = result.concat(this.checkExpression(switchCaseStat.expression(0), errorPrefix));
                }
            } else {
                if (switchCaseStat.expression().length !== 0 || switchCaseStat.TEXT().length !== 0) {
                    result.push(
                        this.buildLGDiagnostic(TemplateErrors.extraExpressionInSwitchCase, undefined, switchCaseStat)
                    );
                }
            }
            if (caseExpr || defaultExpr) {
                if (iterNode.normalTemplateBody()) {
                    result = result.concat(this.visit(iterNode.normalTemplateBody()));
                } else {
                    result.push(
                        this.buildLGDiagnostic(
                            TemplateErrors.missingTemplateBodyInSwitchCase,
                            undefined,
                            switchCaseStat
                        )
                    );
                }
            }
            idx = idx + 1;
        }

        return result;
    }

    /**
     * Visit a parse tree produced by `LGTemplateParser.normalTemplateString`.
     *
     * @param context The parse tree.
     * @returns The result of visiting normal template string.
     */
    visitNormalTemplateString(context: NormalTemplateStringContext): Diagnostic[] {
        const prefixErrorMsg = TemplateExtensions.getPrefixErrorMessage(context);
        let result: Diagnostic[] = [];

        for (const expression of context.expression()) {
            result = result.concat(this.checkExpression(expression, prefixErrorMsg));
        }

        const multiLinePrefix = context.MULTILINE_PREFIX();
        const multiLineSuffix = context.MULTILINE_SUFFIX();

        if (multiLinePrefix !== undefined && multiLineSuffix === undefined) {
            result.push(this.buildLGDiagnostic(TemplateErrors.noEndingInMultiline, undefined, context));
        }
        return result;
    }

    /**
     * Gets the default value returned by visitor methods.
     *
     * @returns Empty [Diagnostic](xref:botbuilder-lg.Diagnostic) array.
     */
    protected defaultResult(): Diagnostic[] {
        return [];
    }

    /**
     * @private
     */
    private checkExpression(expressionContext: ParserRuleContext, prefix = ''): Diagnostic[] {
        const result: Diagnostic[] = [];
        let exp = expressionContext.text;
        if (!exp.endsWith('}')) {
            result.push(this.buildLGDiagnostic(TemplateErrors.noCloseBracket, undefined, expressionContext));
        } else {
            exp = TemplateExtensions.trimExpression(exp);

            try {
                this.expressionParser.parse(exp);
            } catch (e) {
                const suffixErrorMsg = Evaluator.concatErrorMsg(TemplateErrors.expressionParseError(exp), e.message);
                const errorMsg = Evaluator.concatErrorMsg(prefix, suffixErrorMsg);
                result.push(this.buildLGDiagnostic(errorMsg, undefined, expressionContext));

                return result;
            }
        }

        return result;
    }

    /**
     * @private
     */
    private buildLGDiagnostic(
        message: string,
        severity: DiagnosticSeverity = undefined,
        context: ParserRuleContext = undefined
    ): Diagnostic {
        const lineOffset = this.currentTemplate !== undefined ? this.currentTemplate.sourceRange.range.start.line : 0;

        let templateNameInfo = '';
        if (
            this.currentTemplate !== undefined &&
            this.currentTemplate.name.startsWith(Templates.inlineTemplateIdPrefix)
        ) {
            templateNameInfo = `[${this.currentTemplate.name}]`;
        }

        const range =
            context === undefined
                ? new Range(lineOffset + 1, 0, lineOffset + 1, 0)
                : TemplateExtensions.convertToRange(context, lineOffset);
        return new Diagnostic(range, templateNameInfo + message, severity, this.templates.source);
    }
}
