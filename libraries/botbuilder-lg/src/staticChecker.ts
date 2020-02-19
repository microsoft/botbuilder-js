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
import { ExpressionEngine, ExpressionParserInterface } from 'botframework-expressions';
import * as fs from 'fs';
import * as path from 'path';
import { Diagnostic, DiagnosticSeverity } from './diagnostic';
import { Evaluator } from './evaluator';
import * as lp from './generated/LGFileParser';
import { normalizePath } from './extensions';
import { LGFileParserVisitor } from './generated/LGFileParserVisitor';
import { LGFile } from './lgFile';
import { LGParser, ImportResolverDelegate } from './lgParser';
import { LGErrors } from './lgErrors';
import { Position } from './position';
import { Range } from './range';

/// <summary>
/// LG managed code checker.
/// </summary>
class StaticCheckerInner extends AbstractParseTreeVisitor<Diagnostic[]> implements LGFileParserVisitor<Diagnostic[]> {
    private readonly baseExpressionEngine: ExpressionEngine;
    private readonly lgFile: LGFile;
    private visitedTemplateNames: string[];
    private _expressionParser: ExpressionParserInterface;

    public constructor(lgFile: LGFile, expressionEngine: ExpressionEngine = null) {
        super();
        this.lgFile = lgFile;
        this.baseExpressionEngine = expressionEngine? expressionEngine : new ExpressionEngine();
    }

    // Create a property because we want this to be lazy loaded
    private get expressionParser(): ExpressionParserInterface {
        if (this._expressionParser === undefined)
        {
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
            result.push(this.buildLGDiagnostic({
                message: LGErrors.noTemplate,
                severity: DiagnosticSeverity.Warning
            }));

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
        if (errorTemplateName != null)
        {
            result.push(this.buildLGDiagnostic({message: LGErrors.invalidTemplateName, context: errorTemplateName}));
        }
        else
        {
            var templateName = context.templateNameLine().templateName().text;

            if (this.visitedTemplateNames.includes(templateName))
            {
                result.push(this.buildLGDiagnostic({message: LGErrors.duplicatedTemplateInSameTemplate(templateName), context: templateNameLine}));
            }
            else
            {
                this.visitedTemplateNames.push(templateName);
                for (const reference of this.lgFile.references)
                {
                    var sameTemplates = reference.templates.filter(u => u.name == templateName);
                    for(const sameTemplate of sameTemplates)
                    {
                        result.push(this.buildLGDiagnostic({message: LGErrors.duplicatedTemplateInDiffTemplate(sameTemplate.name, sameTemplate.source), context: templateNameLine}));
                    }
                }

                if (result.length > 0)
                {
                    return result;
                }
                else
                {
                    if (context.templateBody() == null)
                    {
                        result.push(this.buildLGDiagnostic({message: LGErrors.noTemplateBody(templateName), severity: DiagnosticSeverity.Warning, context: context.templateNameLine()}));
                    }
                    else
                    {
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
                result.push(this.buildLGDiagnostic({
                    message: `Invalid template body line, did you miss '-' at line begin`,
                    context: errorTemplateStr}));
            } else {
                result = result.concat(this.visit(templateStr));
            }
        }

        return result;
    }

    public visitStructuredTemplateBody(context: lp.StructuredTemplateBodyContext): Diagnostic[] {
        let result: Diagnostic[] = [];

        if (context.structuredBodyNameLine().errorStructuredName() !== undefined) {
            result.push(this.buildLGDiagnostic({message: `Structured name format error.`, context: context.structuredBodyNameLine()}));
        }

        if (context.structuredBodyEndLine() === undefined) {
            result.push(this.buildLGDiagnostic({message: `Structured LG missing ending ']'.`, context: context}));
        }

        const bodys = context.structuredBodyContentLine();
        if (bodys === null || bodys.length === 0) {
            result.push(this.buildLGDiagnostic({message: `Structured LG content is empty.`, context: context}));
        } else {
            for (const body of bodys) {
                if (body.errorStructureLine() !== undefined) {
                    result.push(this.buildLGDiagnostic({message: `structured body format error.`, context: body.errorStructureLine()}));
                } else if (body.objectStructureLine() !== undefined) {
                    result = result.concat(this.checkExpression(body.objectStructureLine().text, body.objectStructureLine()));
                } else {
                    const structureValues = body.keyValueStructureLine().keyValueStructureValue();
                    for (const structureValue of structureValues) {
                        for (const expr of structureValue.EXPRESSION_IN_STRUCTURE_BODY()) {
                            result = result.concat(this.checkExpression(expr.text, context));
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
            const  conditionNode: lp.IfConditionContext = ifRule.ifCondition();
            const ifExpr: boolean = conditionNode.IF() !== undefined;
            const elseIfExpr: boolean = conditionNode.ELSEIF() !== undefined;
            const elseExpr: boolean = conditionNode.ELSE() !== undefined;

            const node: TerminalNode = ifExpr ? conditionNode.IF() :
                elseIfExpr ? conditionNode.ELSEIF() :
                    conditionNode.ELSE();

            if (node.text.split(' ').length - 1 > 1) {
                result.push(this.buildLGDiagnostic({
                    // tslint:disable-next-line: max-line-length
                    message: `At most 1 whitespace is allowed between IF/ELSEIF/ELSE and :.`,
                    context: conditionNode
                }));
            }

            if (idx === 0 && !ifExpr) {
                result.push(this.buildLGDiagnostic({
                    message: `condition is not start with if`,
                    severity: DiagnosticSeverity.Warning,
                    context: conditionNode
                }));
            }

            if (idx > 0 && ifExpr) {
                result.push(this.buildLGDiagnostic({
                    message: `condition can't have more than one if`,
                    context: conditionNode
                }));
            }

            if (idx === ifRules.length - 1 && !elseExpr) {
                result.push(this.buildLGDiagnostic({
                    message: `condition is not end with else`,
                    severity: DiagnosticSeverity.Warning,
                    context: conditionNode
                }));
            }

            if (idx > 0 && idx < ifRules.length - 1 && !elseIfExpr) {
                result.push(this.buildLGDiagnostic({
                    message: `only elseif is allowed in middle of condition`,
                    context: conditionNode
                }));
            }

            if (!elseExpr) {
                if (ifRule.ifCondition().EXPRESSION().length !== 1) {
                    result.push(this.buildLGDiagnostic({
                        message: `if and elseif should followed by one valid expression`,
                        context: conditionNode
                    }));
                } else {
                    result = result.concat(this.checkExpression(ifRule.ifCondition().EXPRESSION(0).text, conditionNode));
                }
            } else {
                if (ifRule.ifCondition().EXPRESSION().length !== 0) {
                    result.push(this.buildLGDiagnostic({
                        message: `else should not followed by any expression`,
                        context: conditionNode
                    }));
                }
            }
            if (ifRule.normalTemplateBody() !== undefined) {
                result = result.concat(this.visit(ifRule.normalTemplateBody()));
            } else {
                result.push(this.buildLGDiagnostic({
                    message: `no normal template body in condition block`,
                    context: conditionNode
                }));
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
                result.push(this.buildLGDiagnostic({
                    // tslint:disable-next-line: max-line-length
                    message: `At most 1 whitespace is allowed between SWITCH/CASE/DEFAULT and :.`,
                    context: switchCaseStat
                }));
            }

            if (idx === 0 && !switchExpr) {
                result.push(this.buildLGDiagnostic({
                    message: `control flow is not starting with switch`,
                    context: switchCaseStat
                }));
            }

            if (idx > 0 && switchExpr) {
                result.push(this.buildLGDiagnostic({
                    message: `control flow cannot have more than one switch statement`,
                    context: switchCaseStat
                }));
            }

            if (idx > 0 && idx < length - 1 && !caseExpr) {
                result.push(this.buildLGDiagnostic({
                    message: `only case statement is allowed in the middle of control flow`,
                    context: switchCaseStat
                }));
            }

            if (idx === length - 1 && (caseExpr || defaultExpr)) {
                if (caseExpr) {
                    result.push(this.buildLGDiagnostic({
                        message: `control flow is not ending with default statement`,
                        severity: DiagnosticSeverity.Warning,
                        context: switchCaseStat
                    }));
                } else {
                    if (length === 2) {
                        result.push(this.buildLGDiagnostic({
                            message: `control flow should have at least one case statement`,
                            severity: DiagnosticSeverity.Warning,
                            context: switchCaseStat
                        }));
                    }
                }
            }
            if (switchExpr || caseExpr) {
                if (switchCaseStat.EXPRESSION().length !== 1) {
                    result.push(this.buildLGDiagnostic({
                        message: `switch and case should followed by one valid expression`,
                        context: switchCaseStat
                    }));
                } else {
                    result = result.concat(this.checkExpression(switchCaseStat.EXPRESSION(0).text, switchCaseStat));
                }
            } else {
                if (switchCaseStat.EXPRESSION().length !== 0 || switchCaseStat.TEXT().length !== 0) {
                    result.push(this.buildLGDiagnostic({
                        message: `default should not followed by any expression or any text`,
                        context: switchCaseStat
                    }));
                }
            }
            if (caseExpr || defaultExpr) {
                if (iterNode.normalTemplateBody()) {
                    result = result.concat(this.visit(iterNode.normalTemplateBody()));
                } else {
                    result.push(this.buildLGDiagnostic({
                        message: `no normal template body in case or default block`,
                        context: switchCaseStat
                    }));
                }
            }
            idx = idx + 1;
        }

        return result;
    }

    public visitNormalTemplateString(context: lp.NormalTemplateStringContext): Diagnostic[] {
        let result: Diagnostic[] = [];

        for (const expression of context.EXPRESSION()) {
            result = result.concat(this.checkExpression(expression.text, context));
        }

        const multiLinePrefix = context.MULTILINE_PREFIX();
        const multiLineSuffix = context.MULTILINE_SUFFIX();
        
        if (multiLinePrefix !== undefined &&  multiLineSuffix === undefined) {
            result.push(this.buildLGDiagnostic({
                message: 'Close ``` is missing.',
                context: context
            }));
        }
        return result;
    }

    protected defaultResult(): Diagnostic[] {
        return [];
    }

    private checkExpression(exp: string, context: ParserRuleContext): Diagnostic[] {
        const result: Diagnostic[] = [];
        exp = exp.replace(/(^\$*)/g, '')
            .replace(/(^{*)/g, '')
            .replace(/(}*$)/g, '')
            .trim();

        try {
            this.expressionParser.parse(exp);
        } catch (e) {
            result.push(this.buildLGDiagnostic({
                message: e.message.concat(` in expression '${ exp }'`),
                context: context
            }));

            return result;
        }

        return result;
    }

    private buildLGDiagnostic(parameters: { message: string; severity?: DiagnosticSeverity; context?: ParserRuleContext }): Diagnostic {
        const startPosition = parameters.context === undefined ? new Position(0, 0) : new Position(parameters.context.start.line, parameters.context.start.charPositionInLine);
        const stopPosition = parameters.context === undefined ? new Position(0, 0) : new Position(parameters.context.stop.line, parameters.context.stop.charPositionInLine + parameters.context.stop.text.length);
        const severity = parameters.severity? parameters.severity : DiagnosticSeverity.Error;
        const range = new Range(startPosition, stopPosition);
        
        return new Diagnostic(range, parameters.message, severity, this.lgFile.id);
    }
}

/**
 * Static checker tool
 */
export class StaticChecker {
    private readonly expressionEngine: ExpressionEngine;

    public constructor(expressionEngine?: ExpressionEngine) {
        this.expressionEngine = expressionEngine ? expressionEngine : new ExpressionEngine();
    }

    public checkFiles(filePaths: string[], importResolver?: ImportResolverDelegate): Diagnostic[] {
        let result: Diagnostic[] = [];
        filePaths.forEach((filePath: string): void => {
            importResolver = importResolver ? importResolver : LGParser.defaultFileResolver;

            filePath = normalizePath(filePath);
            const lgFile: LGFile = LGParser.parseText(fs.readFileSync(filePath, 'utf-8'), filePath);
            const staticChecker = new StaticCheckerInner(lgFile, this.expressionEngine);
            result = result.concat(staticChecker.check());
        });

        return result;
    }

    public checkFile(filePath: string, importResolver?: ImportResolverDelegate): Diagnostic[] {
        return this.checkFiles([filePath], importResolver);
    }

    public checkText(content: string, id?: string, importResolver?: ImportResolverDelegate): Diagnostic[] {
        if (!importResolver) {
            const importPath: string = normalizePath(id);
            if (!path.isAbsolute(importPath)) {
                throw new Error('[Error] id must be full path when importResolver is empty');
            }
        }

        let result: Diagnostic[] = [];
        const lgFile: LGFile = LGParser.parseText(content, id);
        const staticChecker = new StaticCheckerInner(lgFile, this.expressionEngine);
        result = result.concat(staticChecker.check());

        return result;
    }
}
