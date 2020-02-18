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
import { keyBy } from 'lodash';
import * as path from 'path';
import { Diagnostic, DiagnosticSeverity } from './diagnostic';
import { Evaluator } from './evaluator';
import * as lp from './generated/LGFileParser';
import { LGFileParserVisitor } from './generated/LGFileParserVisitor';
import { ImportResolver, ImportResolverDelegate } from './importResolver';
import { LGException } from './lgException';
import { LGParser } from './lgParser';
import { LGResource } from './lgResource';
import { LGTemplate } from './lgTemplate';
import { Position } from './position';
import { Range } from './range';


// tslint:disable-next-line: completed-docs
class StaticCheckerInner extends AbstractParseTreeVisitor<Diagnostic[]> implements LGFileParserVisitor<Diagnostic[]> {
    public readonly templates:  LGTemplate[];
    public templateMap: {[name: string]: LGTemplate};
    private currentSource: string = '';
    private readonly baseExpressionEngine: ExpressionEngine;
    private _expressionParser: ExpressionParserInterface;
    private readonly structuredNameRegex: RegExp = new RegExp(/^[a-z0-9_][a-z0-9_\-\.]*$/i);

    public constructor(templates: LGTemplate[], expressionEngine: ExpressionEngine) {
        super();
        this.templates = templates;
        this.baseExpressionEngine = expressionEngine;
    }

    private get expressionParser(): ExpressionParserInterface {
        if (this._expressionParser === undefined) {
            const evaluator: Evaluator = new Evaluator(this.templates, this.baseExpressionEngine);
            this._expressionParser = evaluator.expressionEngine;
        }

        return this._expressionParser;
    }

    public check(): Diagnostic[] {
        let result: Diagnostic[] = [];

        // check dup first
        const grouped: {[name: string]: LGTemplate[]} = {};
        this.templates.forEach((t: LGTemplate): void => {
            if (!(t.name in grouped)) {
                grouped[t.name] = [];
            }
            grouped[t.name].push(t);
        });

        for (const key of Object.keys(grouped)) {
            const group: LGTemplate[] = grouped[key];
            if (group.length > 1) {
                const sources: string = group.map((x: LGTemplate): string => x.source).join(':');
                result.push(this.buildLGDiagnostic({ message: `Dup definitions found for template ${ key } in ${ sources }` }));
            }
        }

        if (result.length > 0) {
            // can't check other errors if there is a dup
            return result;
        }

        // we can safely convert now, because we know there is no dup
        this.templateMap = keyBy(this.templates, (t: LGTemplate): string => t.name);

        if (this.templates.length <= 0) {
            result.push(this.buildLGDiagnostic({
                message: `File must have at least one template definition`,
                severity: DiagnosticSeverity.Warning
            }));
        }

        this.templates.forEach((template: LGTemplate): void => {
            this.currentSource = template.source;
            result = result.concat(this.visit(template.parseTree));
        });

        return result;
    }

    public visitTemplateDefinition(context: lp.TemplateDefinitionContext): Diagnostic[] {
        let result: Diagnostic[] = [];
        const templateNameLine: lp.TemplateNameLineContext = context.templateNameLine();
        const errorTemplateName: lp.ErrorTemplateNameContext = templateNameLine.errorTemplateName();
        if (errorTemplateName) {
            result.push(this.buildLGDiagnostic({
                message: `Not a valid template name line`,
                context: errorTemplateName
            }));
        } else {
            const templateName: string = context.templateNameLine().templateName().text;
            if (!context.templateBody()) {
                result.push(this.buildLGDiagnostic({
                    message: `There is no template body in template ${ templateName }`,
                    context: context.templateNameLine(),
                    severity: DiagnosticSeverity.Warning
                }));
            } else {
                result = result.concat(this.visit(context.templateBody()));
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
        let message: string = parameters.message;
        const severity: DiagnosticSeverity = parameters.severity === undefined ? DiagnosticSeverity.Error : parameters.severity;
        const context: ParserRuleContext = parameters.context;
        // tslint:disable-next-line: max-line-length
        const startPosition: Position = !context ? new Position(0, 0) : new Position(context.start.line, context.start.charPositionInLine);
        // tslint:disable-next-line: max-line-length
        const stopPosition: Position = !context ? new Position(0, 0) : new Position(context.stop.line, context.stop.charPositionInLine + context.stop.text.length);
        const range: Range = new Range(startPosition, stopPosition);
        message = `error message: ${ message }`;
        if (this.currentSource !== undefined && this.currentSource !== '') {
            message = `source: ${ this.currentSource }. ${ message }`;
        }

        return new Diagnostic(range, message, severity);
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
        let templates: LGTemplate[] = [];
        let isParseSuccess = true;

        try {
            let totalLGResources: LGResource[] = [];
            filePaths.forEach((filePath: string): void => {
                importResolver = importResolver ? importResolver : ImportResolver.fileResolver;

                filePath = path.normalize(ImportResolver.normalizePath(filePath));
                const rootResource: LGResource = LGParser.parse(fs.readFileSync(filePath, 'utf-8'), filePath);
                const lgResources: LGResource[] = rootResource.discoverLGResources(importResolver);
                totalLGResources = totalLGResources.concat(lgResources);
            });

            // Remove duplicated lg files by id
            // tslint:disable-next-line: max-line-length
            const deduplicatedLGResources: LGResource[] = totalLGResources.filter((resource: LGResource, index: number, self: LGResource[]): boolean =>
                index === self.findIndex((t: LGResource): boolean => (
                    t.id === resource.id
                ))
            );

            templates = deduplicatedLGResources.reduce((acc: LGTemplate[], x: LGResource): any =>
                acc = acc.concat(x.templates),         []
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
        if (!importResolver) {
            const importPath: string = ImportResolver.normalizePath(id);
            if (!path.isAbsolute(importPath)) {
                throw new Error('[Error] id must be full path when importResolver is empty');
            }
        }

        let result: Diagnostic[] = [];
        let templates: LGTemplate[] = [];
        let isParseSuccess = true;

        try {
            const rootResource: LGResource = LGParser.parse(content, id);
            const resources: LGResource[] = rootResource.discoverLGResources(importResolver);

            templates = resources.reduce((acc: LGTemplate[], x: LGResource): any =>
                // tslint:disable-next-line: align
                acc = acc.concat(x.templates), []
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
        return new StaticCheckerInner(templates, this.expressionEngine).check();
    }
}
