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
import * as fs from 'fs';
import { keyBy } from 'lodash';
import * as path from 'path';
import { Diagnostic, DiagnosticSeverity, Position, Range } from './diagnostic';
import { Evaluator } from './evaluator';
import * as lp from './generated/LGFileParser';
import { LGFileParserVisitor } from './generated/LGFileParserVisitor';
import { ImportResolver, ImportResolverDelegate } from './importResolver';
import { LGException } from './lgException';
import { LGParser } from './lgParser';
import { LGResource } from './lgResource';
import { LGTemplate } from './lgTemplate';
import { IExpressionParser } from 'botbuilder-expression';

/**
 * Static checker tool
 */
export class StaticChecker {
    private readonly expressionEngine: ExpressionEngine;

    constructor(expressionEngine?: ExpressionEngine) {
        this.expressionEngine = expressionEngine !== undefined ? expressionEngine : new ExpressionEngine();
    }

    public checkFiles(filePaths: string[], importResolver?: ImportResolverDelegate): Diagnostic[] {
        let result: Diagnostic[] = [];
        let templates: LGTemplate[] = [];
        let isParseSuccess: boolean = true;

        try {
            let totalLGResources: LGResource[] = [];
            filePaths.forEach((filePath: string) => {
                importResolver = importResolver !== undefined ? importResolver : ImportResolver.fileResolver;

                filePath = path.normalize(ImportResolver.normalizePath(filePath));
                const rootResource: LGResource = LGParser.parse(fs.readFileSync(filePath, 'utf-8'), filePath);
                const lgResources: LGResource[] = rootResource.discoverLGResources(importResolver);
                totalLGResources = totalLGResources.concat(lgResources);
            });

            // Remove duplicated lg files by id
            // tslint:disable-next-line: max-line-length
            const deduplicatedLGResources: LGResource[] = totalLGResources.filter((resource: LGResource, index: number, self: LGResource[]) =>
                index === self.findIndex((t: LGResource) => (
                    t.Id === resource.Id
                ))
            );

            templates = deduplicatedLGResources.reduce((acc: LGTemplate[], x: LGResource) =>
                acc = acc.concat(x.Templates),         []
            );
        } catch (e) {
            isParseSuccess = false;
            if (e instanceof LGException) {
                result = result.concat(e.getDiagnostic());
            } else {
                const diagnostic: Diagnostic = new Diagnostic(new Range(new Position(0, 0), new Position(0, 0)), e.message);
                result.push(diagnostic);
            }
        }

        if (isParseSuccess) {
            result = result.concat(this.checkTemplates(templates));
        }

        return result;
    }

    public checkFile(filePath: string, importResolver?: ImportResolverDelegate): Diagnostic[] {
        return this.checkFiles([filePath], importResolver);
    }

    public checkText(content: string, id?: string, importResolver?: ImportResolverDelegate): Diagnostic[] {
        if (importResolver === undefined) {
            const importPath: string = ImportResolver.normalizePath(id);
            if (!path.isAbsolute(importPath)) {
                throw new Error('[Error] id must be full path when importResolver is empty');
            }
        }

        let result: Diagnostic[] = [];
        let templates: LGTemplate[] = [];
        let isParseSuccess: boolean = true;

        try {
            const rootResource: LGResource = LGParser.parse(content, id);
            const resources: LGResource[] = rootResource.discoverLGResources(importResolver);

            templates = resources.reduce((acc: LGTemplate[], x: LGResource) =>
                // tslint:disable-next-line: align
                acc = acc.concat(x.Templates), []
            );
        } catch (e) {
            isParseSuccess = false;
            if (e instanceof LGException) {
                result = result.concat(e.getDiagnostic());
            } else {
                const diagnostic: Diagnostic = new Diagnostic(new Range(new Position(0, 0), new Position(0, 0)), e.message);
                result.push(diagnostic);
            }
        }

        if (isParseSuccess) {
            result = result.concat(this.checkTemplates(templates));
        }

        return result;
    }

    public checkTemplates(templates: LGTemplate[]): Diagnostic[] {
        // tslint:disable-next-line: no-use-before-declare
        return new StaticCheckerInner(templates, this.expressionEngine).Check();
    }
}

// tslint:disable-next-line: completed-docs
class StaticCheckerInner extends AbstractParseTreeVisitor<Diagnostic[]> implements LGFileParserVisitor<Diagnostic[]> {
    public readonly Templates:  LGTemplate[];
    public TemplateMap: {[name: string]: LGTemplate};
    private currentSource: string = '';
    private readonly baseExpressionEngine: ExpressionEngine;
    private _expressionParser: IExpressionParser;
    private readonly expressionRecognizeRegex: RegExp = new RegExp(/@?(?<!\\)\{.+?(?<!\\)\}/g);
    private readonly escapeSeperatorRegex : RegExp = new RegExp(/(?<!\\)\|/g);

    constructor(templates: LGTemplate[], expressionEngine: ExpressionEngine) {
        super();
        this.Templates = templates;
        this.baseExpressionEngine = expressionEngine;
    }

    private get ExpressionParser(): IExpressionParser {
        if (this._expressionParser === undefined) {
            const evaluator: Evaluator = new Evaluator(this.Templates, this.baseExpressionEngine);
            this._expressionParser = evaluator.ExpressionEngine;
        }

        return this._expressionParser;
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
                result.push(this.BuildLGDiagnostic({ message: `Dup definitions found for template ${key} in ${sources}` }));
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
            this.currentSource = template.Source;
            result = result.concat(this.visit(template.ParseTree));
        });

        return result;
    }

    public visitTemplateDefinition(context: lp.TemplateDefinitionContext): Diagnostic[] {
        let result: Diagnostic[] = [];
        const templateNameLine: lp.TemplateNameLineContext = context.templateNameLine();
        const errorTemplateName: lp.ErrorTemplateNameContext = templateNameLine.errorTemplateName();
        if (errorTemplateName !== undefined) {
            result.push(this.BuildLGDiagnostic({
                message: `Not a valid template name line`,
                context: errorTemplateName
            }));
        } else {
            const templateName: string = context.templateNameLine().templateName().text;
            if (context.templateBody() === undefined) {
                result.push(this.BuildLGDiagnostic({
                    message: `There is no template body in template ${templateName}`,
                    context: context.templateNameLine(),
                    severity: DiagnosticSeverity.Warning
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
            }
        }

        return result;
    }

    public visitNormalTemplateBody(context: lp.NormalTemplateBodyContext): Diagnostic[] {
        let result: Diagnostic[] = [];
        for (const templateStr of context.templateString()) {
            const errorTemplateStr: lp.ErrorTemplateStringContext = templateStr.errorTemplateString();

            if (errorTemplateStr !== undefined) {
                result.push(this.BuildLGDiagnostic({
                    message: `Invalid template body line, did you miss '-' at line begin`,
                    context: errorTemplateStr}));
            } else {
                const item: Diagnostic[] = this.visit(templateStr);
                result = result.concat(item);
            }
        }

        return result;
    }

    public visitStructuredTemplateBody(context: lp.StructuredTemplateBodyContext): Diagnostic[] {
        let result: Diagnostic[] = [];
        const content: lp.StructuredBodyContentLineContext = context.structuredBodyContentLine();
        let bodys: TerminalNode[] = [];
        if (content !== undefined) {
            bodys = content.STRUCTURED_CONTENT();
        }

        if (bodys === undefined || bodys.length === 0 || bodys.find(u => u !== undefined && u.text.trim().length !== 0) === undefined) {
            result.push(this.BuildLGDiagnostic({
                message: `Structured content is empty`,
                context: content}));
        } else {
            for (const body of bodys) {
                const line: string = body.text.trim();

                if (line !== '') {
                    const start: number = line.indexOf('=');
                    if (start < 0 && !this.isPureExpression(line)) {
                        result.push(this.BuildLGDiagnostic({
                            message: `Structured content does not support`,
                            context: content}));
                    } else if (start > 0) {
                        const originValue: string = line.substr(start + 1).trim();

                        const valueArray: string[] = originValue.split(this.escapeSeperatorRegex);
                        if (valueArray.length === 1) {
                            result = result.concat(this.CheckText(originValue, context));
                        } else {
                            for (const item of valueArray) {
                                result = result.concat(this.CheckText(item.trim(), context));
                            }
                        }
                    } else if (this.isPureExpression(line)) {
                        result = result.concat(this.CheckExpression(line, context));
                    }
                }
            }
        }

        return result;
    }

    public visitIfElseBody(context: lp.IfElseBodyContext): Diagnostic[] {
        let result: Diagnostic[] = [];
        const ifRules: lp.IfConditionRuleContext[] = context.ifElseTemplateBody().ifConditionRule();

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
                    message: `At most 1 whitespace is allowed between IF/ELSEIF/ELSE and :.`,
                    context: conditionNode
                }));
            }

            if (idx === 0 && !ifExpr) {
                result.push(this.BuildLGDiagnostic({
                    message: `condition is not start with if`,
                    severity: DiagnosticSeverity.Warning,
                    context: conditionNode
                }));
            }

            if (idx > 0 && ifExpr) {
                result.push(this.BuildLGDiagnostic({
                    message: `condition can't have more than one if`,
                    context: conditionNode
                }));
            }

            if (idx === ifRules.length - 1 && !elseExpr) {
                result.push(this.BuildLGDiagnostic({
                    message: `condition is not end with else`,
                    severity: DiagnosticSeverity.Warning,
                    context: conditionNode
                }));
            }

            if (idx > 0 && idx < ifRules.length - 1 && !elseIfExpr) {
                result.push(this.BuildLGDiagnostic({
                    message: `only elseif is allowed in middle of condition`,
                    context: conditionNode
                }));
            }

            if (!elseExpr) {
                if (ifRule.ifCondition().EXPRESSION().length !== 1) {
                    result.push(this.BuildLGDiagnostic({
                        message: `if and elseif should followed by one valid expression`,
                        context: conditionNode
                    }));
                } else {
                    result = result.concat(this.CheckExpression(ifRule.ifCondition().EXPRESSION(0).text, conditionNode));
                }
            } else {
                if (ifRule.ifCondition().EXPRESSION().length !== 0) {
                    result.push(this.BuildLGDiagnostic({
                        message: `else should not followed by any expression`,
                        context: conditionNode
                    }));
                }
            }
            if (ifRule.normalTemplateBody() !== undefined) {
                result = result.concat(this.visit(ifRule.normalTemplateBody()));
            } else {
                result.push(this.BuildLGDiagnostic({
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
        let idx: number = 0;
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
                result.push(this.BuildLGDiagnostic({
                    // tslint:disable-next-line: max-line-length
                    message: `At most 1 whitespace is allowed between SWITCH/CASE/DEFAULT and :.`,
                    context: switchCaseStat
                }));
            }

            if (idx === 0 && !switchExpr) {
                result.push(this.BuildLGDiagnostic({
                    message: `control flow is not starting with switch`,
                    context: switchCaseStat
                }));
            }

            if (idx > 0 && switchExpr) {
                result.push(this.BuildLGDiagnostic({
                    message: `control flow cannot have more than one switch statement`,
                    context: switchCaseStat
                }));
            }

            if (idx > 0 && idx < length - 1 && !caseExpr) {
                result.push(this.BuildLGDiagnostic({
                    message: `only case statement is allowed in the middle of control flow`,
                    context: switchCaseStat
                }));
            }

            if (idx === length - 1 && (caseExpr || defaultExpr)) {
                if (caseExpr) {
                    result.push(this.BuildLGDiagnostic({
                        message: `control flow is not ending with default statement`,
                        severity: DiagnosticSeverity.Warning,
                        context: switchCaseStat
                    }));
                } else {
                    if (length === 2) {
                        result.push(this.BuildLGDiagnostic({
                            message: `control flow should have at least one case statement`,
                            severity: DiagnosticSeverity.Warning,
                            context: switchCaseStat
                        }));
                    }
                }
            }
            if (switchExpr || caseExpr) {
                if (switchCaseStat.EXPRESSION().length !== 1) {
                    result.push(this.BuildLGDiagnostic({
                        message: `switch and case should followed by one valid expression`,
                        context: switchCaseStat
                    }));
                } else {
                    result = result.concat(this.CheckExpression(switchCaseStat.EXPRESSION(0).text, switchCaseStat));
                }
            } else {
                if (switchCaseStat.EXPRESSION().length !== 0 || switchCaseStat.TEXT().length !== 0) {
                    result.push(this.BuildLGDiagnostic({
                        message: `default should not followed by any expression or any text`,
                        context: switchCaseStat
                    }));
                }
            }
            if (caseExpr || defaultExpr) {
                if (iterNode.normalTemplateBody() !== undefined) {
                    result = result.concat(this.visit(iterNode.normalTemplateBody()));
                } else {
                    result.push(this.BuildLGDiagnostic({
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
        for (const child of context.children) {
            const node: TerminalNode = child as TerminalNode;
            switch (node.symbol.type) {
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
                    result = result.concat(this.CheckErrorMultiLineText(node.text, context));
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
        const result: Diagnostic[] = [];
        exp = exp.replace(/(^\[*)/g, '')
                .replace(/(\]*$)/g, '')
                .trim();

        let expression: string = exp;
        if (exp.indexOf('(') < 0) {
            if (exp in this.TemplateMap) {
                expression = exp.concat('(')
                    .concat(this.TemplateMap[exp].Parameters.join())
                    .concat(')');
            } else {
                expression = exp.concat('()');
            }
        }

        try {
            this.ExpressionParser.parse(expression);
        } catch (e) {
            result.push(this.BuildLGDiagnostic({
                message: e.message.concat(` in template reference '${exp}'`),
                context: context
            }));

            return result;
        }

        return result;
    }

    private CheckMultiLineText(exp: string, context: ParserRuleContext): Diagnostic[] {
        exp = exp.substr(3, exp.length - 6);

        return this.CheckText(exp, context, true);
    }

    private CheckText(exp: string, context: ParserRuleContext, isMultiLineText : boolean = false): Diagnostic[] {
        let result: Diagnostic[] = [];
        const reg: RegExp = isMultiLineText ? /@\{[^{}]+\}/g : /@?\{[^{}]+\}/g;
        const matches: string[] = exp.match(reg);
        if (matches !== null && matches !== undefined) {
            for (const match of matches) {
                result = result.concat(this.CheckExpression(match, context));
            }
        }

        return result;
    }

    private CheckErrorMultiLineText(exp: string, context: ParserRuleContext): Diagnostic[] {
        const result: Diagnostic[] = [];

        if (exp.startsWith('```')) {
            result.push(this.BuildLGDiagnostic({
                message: 'Multi line variation must be enclosed in ```',
                context: context
            }));
        }

        return result;
    }


    private CheckExpression(exp: string, context: ParserRuleContext): Diagnostic[] {
        const result: Diagnostic[] = [];
        exp = exp.replace(/(^@*)/g, '')
                .replace(/(^{*)/g, '')
                .replace(/(}*$)/g, '')
                .trim();

        try {
            this.ExpressionParser.parse(exp);
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
        let message: string = parameters.message;
        const severity: DiagnosticSeverity = parameters.severity === undefined ? DiagnosticSeverity.Error : parameters.severity;
        const context: ParserRuleContext = parameters.context;
        // tslint:disable-next-line: max-line-length
        const startPosition: Position = context === undefined ? new Position(0, 0) : new Position(context.start.line, context.start.charPositionInLine);
        // tslint:disable-next-line: max-line-length
        const stopPosition: Position = context === undefined ? new Position(0, 0) : new Position(context.stop.line, context.stop.charPositionInLine + context.stop.text.length);
        const range: Range = new Range(startPosition, stopPosition);
        message = `error message: ${message}`;
        if (this.currentSource !== undefined && this.currentSource !== '') {
            message = `source: ${this.currentSource}. ${message}`;
        }

        return new Diagnostic(range, message, severity);
    }

    private isPureExpression(exp: string): boolean {
        if (exp === undefined || exp.length === 0) {
            return false;
        }

        exp = exp.trim();
        const expressions: RegExpMatchArray = exp.match(this.expressionRecognizeRegex);

        return expressions !== null && expressions !== undefined && expressions.length === 1 && expressions[0] === exp;
    }

}
