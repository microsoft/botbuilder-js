/* eslint-disable security/detect-object-injection */
/* eslint-disable security/detect-non-literal-fs-filename */
/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as fs from 'fs';
import * as path from 'path';
import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import { CustomizedMemory } from './customizedMemory';
import { EvaluationOptions, LGCacheScope } from './evaluationOptions';
import { EvaluationTarget } from './evaluationTarget';
import { LGTemplateParserVisitor } from './generated/LGTemplateParserVisitor';
import { ParserRuleContext } from 'antlr4ts/ParserRuleContext';
import { Template } from './template';
import { TemplateErrors } from './templateErrors';
import { TemplateExtensions } from './templateExtensions';
import { Templates } from './templates';
import keyBy = require('lodash/keyBy');

import {
    Constant,
    EvaluatorLookup,
    Expression,
    ExpressionEvaluator,
    ExpressionParser,
    ExpressionType,
    Extensions,
    FunctionUtils,
    MemoryInterface,
    Options,
    ReturnType,
    SimpleObjectMemory,
} from 'adaptive-expressions';

import {
    ExpressionContext,
    ExpressionInStructureContext,
    IfConditionContext,
    IfConditionRuleContext,
    IfElseBodyContext,
    KeyValueStructureLineContext,
    LGTemplateParser,
    NormalBodyContext,
    NormalTemplateBodyContext,
    NormalTemplateStringContext,
    StructuredTemplateBodyContext,
    SwitchCaseBodyContext,
    SwitchCaseRuleContext,
    TemplateStringContext,
} from './generated/LGTemplateParser';

/**
 * Filr formats.
 */
export enum FileFormat {
    /**
     * Get the evaluated result from the Raw.
     */
    Evaluated = 'Evaluated',

    /**
     * Get raw text content of the file.
     */
    Raw = 'Raw',

    /**
     * Get binary result from the file.
     */
    Binary = 'Binary',
}

/**
 * Evaluation runtime engine
 */
export class Evaluator extends AbstractParseTreeVisitor<unknown> implements LGTemplateParserVisitor<unknown> {
    /**
     * Templates.
     */
    readonly templates: Templates;

    /**
     * Expression parser.
     */
    readonly expressionParser: ExpressionParser;

    /**
     * TemplateMap.
     */
    readonly templateMap: { [name: string]: Template };
    private readonly evaluationTargetStack: EvaluationTarget[] = [];
    private readonly lgOptions: EvaluationOptions;
    private readonly cacheResult: Map<string, unknown> = new Map<string, unknown>();

    static readonly LGType = 'lgType';
    static readonly activityAttachmentFunctionName = 'ActivityAttachment';
    static readonly fromFileFunctionName = 'fromFile';
    static readonly templateFunctionName = 'template';
    static readonly isTemplateFunctionName = 'isTemplate';
    static readonly expandTextFunctionName = 'expandText';
    static readonly ReExecuteSuffix = '!';

    /**
     * Creates a new instance of the [Evaluator](xref:botbuilder-lg.Evaluator) class.
     *
     * @param templates Templates.
     * @param opt Options for LG.
     */
    constructor(templates: Templates, opt?: EvaluationOptions) {
        super();
        this.templates = templates;
        this.templateMap = keyBy(templates.allTemplates, (t: Template): string => t.name);
        this.lgOptions = opt;
        this.cacheResult.clear();

        // generate a new customzied expression parser by injecting the templates as functions
        this.expressionParser = new ExpressionParser(
            this.customizedEvaluatorLookup(templates.expressionParser.EvaluatorLookup)
        );
    }

    /**
     * Evaluate a template with given name and scope.
     *
     * @param inputTemplateName Template name.
     * @param scope Scope.
     * @returns Evaluate result.
     */
    evaluateTemplate(inputTemplateName: string, scope: unknown): unknown {
        const memory = scope instanceof CustomizedMemory ? scope : new CustomizedMemory(scope);
        const { reExecute, pureTemplateName: templateName } = this.parseTemplateName(inputTemplateName);

        if (!(templateName in this.templateMap)) {
            throw new Error(TemplateErrors.templateNotExist(templateName));
        }

        const templateTarget: EvaluationTarget = new EvaluationTarget(templateName, memory);
        const currentEvulateId: string = templateTarget.getId();

        if (this.evaluationTargetStack.some((u: EvaluationTarget): boolean => u.getId() === currentEvulateId)) {
            throw new Error(
                `${TemplateErrors.loopDetected} ${this.evaluationTargetStack
                    .reverse()
                    .map((u: EvaluationTarget): string => u.templateName)
                    .join(' => ')}`
            );
        }

        let result: unknown;
        let hasResult = false;
        if (!reExecute) {
            if (this.lgOptions.cacheScope === LGCacheScope.Global) {
                if (this.cacheResult.has(currentEvulateId)) {
                    result = this.cacheResult.get(currentEvulateId);
                    hasResult = true;
                }
            } else if (this.lgOptions.cacheScope === undefined || this.lgOptions.cacheScope === LGCacheScope.Local) {
                let previousEvaluateTarget: EvaluationTarget;
                if (this.evaluationTargetStack.length !== 0) {
                    previousEvaluateTarget = this.evaluationTargetStack[this.evaluationTargetStack.length - 1];
                    if (previousEvaluateTarget.cachedEvaluatedChildren.has(currentEvulateId)) {
                        result = previousEvaluateTarget.cachedEvaluatedChildren.get(currentEvulateId);
                        hasResult = true;
                    }
                }
            }
        }

        if (!hasResult) {
            this.evaluationTargetStack.push(templateTarget);
            result = this.visit(this.templateMap[templateName].templateBodyParseTree);
            this.evaluationTargetStack.pop();

            if (!reExecute) {
                if (this.lgOptions.cacheScope === LGCacheScope.Global) {
                    this.cacheResult.set(currentEvulateId, result);
                } else if (
                    this.lgOptions.cacheScope === undefined ||
                    this.lgOptions.cacheScope === LGCacheScope.Local
                ) {
                    if (this.evaluationTargetStack.length !== 0) {
                        this.evaluationTargetStack[this.evaluationTargetStack.length - 1].cachedEvaluatedChildren.set(
                            currentEvulateId,
                            result
                        );
                    }
                }
            }
        }

        return result;
    }

    /**
     * Visit a parse tree produced by LGTemplateParser.structuredTemplateBody.
     *
     * @param ctx The parse tree.
     * @returns The result of visiting the structured template body.
     */
    visitStructuredTemplateBody(ctx: StructuredTemplateBodyContext): unknown {
        const result: Record<string, unknown> = {};
        const typeName: string = ctx.structuredBodyNameLine().STRUCTURE_NAME().text;
        result[Evaluator.LGType] = typeName;

        const bodys = ctx.structuredBodyContentLine();
        for (const body of bodys) {
            const isKVPairBody = body.keyValueStructureLine() !== undefined;
            if (isKVPairBody) {
                const property = body.keyValueStructureLine().STRUCTURE_IDENTIFIER().text.toLowerCase();
                const value = this.visitStructureValue(body.keyValueStructureLine());
                result[property] = value;
            } else {
                const propertyObject = this.evalExpression(
                    body.expressionInStructure().text,
                    body.expressionInStructure(),
                    body.text
                );
                // Full reference to another structured template is limited to the structured template with same type
                if (
                    propertyObject &&
                    typeof propertyObject === 'object' &&
                    Evaluator.LGType in propertyObject &&
                    propertyObject[Evaluator.LGType].toString() === typeName
                ) {
                    for (const key of Object.keys(propertyObject)) {
                        if (Object.prototype.hasOwnProperty.call(propertyObject, key) && !(key in result)) {
                            result[key] = propertyObject[key];
                        }
                    }
                }
            }
        }

        return result;
    }

    /**
     * @private
     */
    private visitStructureValue(ctx: KeyValueStructureLineContext): unknown {
        const values = ctx.keyValueStructureValue();

        const result = [];
        for (const item of values) {
            if (TemplateExtensions.isPureExpression(item)) {
                result.push(
                    this.evalExpression(item.expressionInStructure(0).text, item.expressionInStructure(0), ctx.text)
                );
            } else {
                let itemStringResult = '';
                for (const child of item.children) {
                    if (child instanceof ExpressionInStructureContext) {
                        const errorPrefix = "Property '" + ctx.STRUCTURE_IDENTIFIER().text + "':";
                        itemStringResult += this.evalExpression(child.text, child, ctx.text, errorPrefix);
                    } else {
                        const node = child as TerminalNode;
                        switch ((node as TerminalNode).symbol.type) {
                            case LGTemplateParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY:
                                itemStringResult += TemplateExtensions.evalEscape(node.text.replace(/\\\|/g, '|'));
                                break;
                            default:
                                itemStringResult += node.text;
                                break;
                        }
                    }
                }

                result.push(itemStringResult.trim());
            }
        }

        return result.length === 1 ? result[0] : result;
    }

    /**
     * Visit a parse tree produced by the normalBody labeled alternative in LGTemplateParser.body.
     *
     * @param ctx The parse tree.
     * @returns The result of visiting the normal body.
     */
    visitNormalBody(ctx: NormalBodyContext): unknown {
        return this.visit(ctx.normalTemplateBody());
    }

    /**
     * Visit a parse tree produced by LGTemplateParser.normalTemplateBody.
     *
     * @param ctx The parse tree.
     * @returns The result of visiting the normal template body.
     */
    visitNormalTemplateBody(ctx: NormalTemplateBodyContext): unknown {
        const normalTemplateStrs: TemplateStringContext[] = ctx.templateString();
        const randomNumber = Extensions.randomNext(this.currentTarget().scope, 0, normalTemplateStrs.length);

        return this.visit(normalTemplateStrs[randomNumber].normalTemplateString());
    }

    /**
     * Visit a parse tree produced by the ifElseBody labeled alternative in LGTemplateParser.body.
     *
     * @param ctx The parse tree.
     * @returns The visitor result.
     */
    visitIfElseBody(ctx: IfElseBodyContext): unknown {
        const ifRules: IfConditionRuleContext[] = ctx.ifElseTemplateBody().ifConditionRule();
        for (const ifRule of ifRules) {
            if (this.evalCondition(ifRule.ifCondition()) && ifRule.normalTemplateBody() !== undefined) {
                return this.visit(ifRule.normalTemplateBody());
            }
        }

        return undefined;
    }

    /**
     * Visit a parse tree produced by LGTemplateParser.normalTemplateString.
     *
     * @param ctx The parse tree.
     * @returns The string result of visiting the normal template string.
     */
    visitNormalTemplateString(ctx: NormalTemplateStringContext): unknown {
        const prefixErrorMsg = TemplateExtensions.getPrefixErrorMessage(ctx);
        const result: unknown[] = [];
        for (const child of ctx.children) {
            if (child instanceof ExpressionContext) {
                result.push(this.evalExpression(child.text, child, ctx.text, prefixErrorMsg));
            } else {
                const node = child as TerminalNode;
                switch (node.symbol.type) {
                    case LGTemplateParser.MULTILINE_SUFFIX:
                    case LGTemplateParser.MULTILINE_PREFIX:
                    case LGTemplateParser.DASH:
                        break;
                    case LGTemplateParser.ESCAPE_CHARACTER:
                        result.push(TemplateExtensions.evalEscape(node.text));
                        break;
                    default: {
                        result.push(node.text);
                        break;
                    }
                }
            }
        }

        if (result.length === 1 && !(typeof result[0] === 'string')) {
            return result[0];
        }

        return result
            .map((u) => {
                if (typeof u === 'string') {
                    return u;
                } else {
                    return JSON.stringify(u);
                }
            })
            .join('');
    }

    /**
     * Constructs the scope for mapping the values of arguments to the parameters of the template.
     * Throws errors if certain errors detected [TemplateErrors](xref:botbuilder-lg.TemplateErrors).
     *
     * @param inputTemplateName Template name to evaluate.
     * @param args Arguments to map to the template parameters.
     * @param allTemplates All templates.
     * @returns The current scope if the number of arguments is 0, otherwise, returns a [CustomizedMemory](xref:botbuilder-lg.CustomizedMemory)
     * with the mapping of the parameter name to the argument value added to the scope.
     */
    constructScope(inputTemplateName: string, args: unknown[], allTemplates: Template[]): MemoryInterface {
        const templateName = this.parseTemplateName(inputTemplateName).pureTemplateName;

        const templateMap = keyBy(allTemplates, (t: Template): string => t.name);
        if (!(templateName in templateMap)) {
            throw new Error(TemplateErrors.templateNotExist(templateName));
        }

        const parameters: string[] = templateMap[templateName].parameters;
        const currentScope = this.currentTarget().scope;

        if (args.length === 0) {
            // no args to construct, inherit from current scope
            return currentScope;
        }

        const newScope: Record<string, unknown> = {};
        parameters.map((e: string, i: number) => (newScope[e] = args[i]));
        const memory = currentScope as CustomizedMemory;
        if (!memory) {
            throw new Error(TemplateErrors.invalidMemory);
        }

        return new CustomizedMemory(memory.globalMemory, SimpleObjectMemory.wrap(newScope));
    }

    /**
     * Visit a parse tree produced by the switchCaseBody labeled alternative in LGTemplateParser.body.
     *
     * @param ctx The parse tree.
     * @returns The string result of visiting the switch case body.
     */
    visitSwitchCaseBody(ctx: SwitchCaseBodyContext): unknown {
        const switchcaseNodes: SwitchCaseRuleContext[] = ctx.switchCaseTemplateBody().switchCaseRule();
        const length: number = switchcaseNodes.length;
        const switchNode: SwitchCaseRuleContext = switchcaseNodes[0];
        const switchExprs = switchNode.switchCaseStat().expression();
        const switchErrorPrefix = "Switch '" + switchExprs[0].text + "': ";
        const switchExprResult = this.evalExpression(
            switchExprs[0].text,
            switchExprs[0],
            switchcaseNodes[0].switchCaseStat().text,
            switchErrorPrefix
        );
        let idx = 0;
        for (const caseNode of switchcaseNodes) {
            if (idx === 0) {
                idx++;
                continue; //skip the first node which is a switch statement
            }
            if (idx === length - 1 && caseNode.switchCaseStat().DEFAULT() !== undefined) {
                const defaultBody: NormalTemplateBodyContext = caseNode.normalTemplateBody();
                if (defaultBody !== undefined) {
                    return this.visit(defaultBody);
                } else {
                    return undefined;
                }
            }

            const caseExprs = caseNode.switchCaseStat().expression();
            const caseErrorPrefix = "Case '" + caseExprs[0].text + "': ";
            const caseExprResult = this.evalExpression(
                caseExprs[0].text,
                caseExprs[0],
                caseNode.switchCaseStat().text,
                caseErrorPrefix
            );
            if (FunctionUtils.commonEquals(switchExprResult, caseExprResult)) {
                return this.visit(caseNode.normalTemplateBody());
            }

            idx++;
        }

        return undefined;
    }

    /**
     * Replaces an expression contained in text.
     *
     * @param exp Expression Text.
     * @param regex Regex to select the text to replace.
     * @returns Text with expression replaced.
     */
    wrappedEvalTextContainsExpression(exp: string, regex: RegExp): string {
        return exp
            .split('')
            .reverse()
            .join('')
            .replace(regex, (sub: string) =>
                this.evalExpression(sub.split('').reverse().join('')).toString().split('').reverse().join('')
            )
            .split('')
            .reverse()
            .join('');
    }

    /**
     * Gets the default value returned by visitor methods.
     *
     * @returns Empty string.
     */
    protected defaultResult(): string {
        return '';
    }

    /**
     * Concatenates two error messages.
     *
     * @param firstError First error message to concatenate.
     * @param secondError Second error message to concatenate.
     * @returns The concatenated error messages.
     */
    static concatErrorMsg(firstError: string, secondError: string): string {
        let errorMsg: string;
        if (!firstError) {
            errorMsg = secondError;
        } else if (!secondError) {
            errorMsg = firstError;
        } else {
            errorMsg = firstError + ' ' + secondError;
        }
        return errorMsg;
    }

    /**
     * Checks an expression result and throws the corresponding error.
     *
     * @param exp Expression text.
     * @param error Error message.
     * @param result Result.
     * @param templateName Template name.
     * @param inlineContent Optional. In line content.
     * @param errorPrefix Optional. Error prefix.
     */
    static checkExpressionResult(
        exp: string,
        error: string,
        result: unknown,
        templateName: string,
        inlineContent = '',
        errorPrefix = ''
    ): void {
        let errorMsg = '';

        let childErrorMsg = '';
        if (error) {
            childErrorMsg = Evaluator.concatErrorMsg(childErrorMsg, error);
        } else if (!result) {
            childErrorMsg = Evaluator.concatErrorMsg(childErrorMsg, TemplateErrors.nullExpression(exp));
        }

        if (inlineContent && inlineContent.trim() !== '') {
            errorMsg = Evaluator.concatErrorMsg(
                errorMsg,
                TemplateErrors.errorExpression(inlineContent, templateName, errorPrefix)
            );
        }

        throw new Error(Evaluator.concatErrorMsg(childErrorMsg, errorMsg));
    }

    /**
     * @private
     */
    private currentTarget(): EvaluationTarget {
        // just don't want to write evaluationTargetStack.Peek() everywhere
        return this.evaluationTargetStack[this.evaluationTargetStack.length - 1];
    }

    /**
     * @private
     */
    private evalCondition(condition: IfConditionContext): boolean {
        const expression = condition.expression()[0]; // Here ts is diff with C#, C# use condition.EXPRESSION(0) == null
        // to judge ELSE condition. But in ts lib this action would throw
        // Error

        if (!expression) {
            return true; // no expression means it's else
        }

        if (this.evalExpressionInCondition(expression, condition.text, "Condition '" + expression.text + "':")) {
            return true;
        }

        return false;
    }

    /**
     * @private
     */
    private evalExpressionInCondition(
        expressionContext: ParserRuleContext,
        contentLine: string,
        errorPrefix = ''
    ): boolean {
        const exp = TemplateExtensions.trimExpression(expressionContext.text);
        const { value: result, error: error } = this.evalByAdaptiveExpression(exp, this.currentTarget().scope);

        if (this.lgOptions.strictMode && (error || !result)) {
            const templateName = this.currentTarget().templateName;

            if (this.evaluationTargetStack.length > 0) {
                this.evaluationTargetStack.pop();
            }

            Evaluator.checkExpressionResult(exp, error, result, templateName, contentLine, errorPrefix);
        } else if (error || !result) {
            return false;
        }

        return true;
    }

    /**
     * @private
     */
    private evalExpression(
        exp: string,
        expressionContext?: ParserRuleContext,
        inlineContent = '',
        errorPrefix = ''
    ): unknown {
        exp = TemplateExtensions.trimExpression(exp);
        const { value: result, error: error } = this.evalByAdaptiveExpression(exp, this.currentTarget().scope);

        if (error || (result === undefined && this.lgOptions.strictMode)) {
            const templateName = this.currentTarget().templateName;

            if (this.evaluationTargetStack.length > 0) {
                this.evaluationTargetStack.pop();
            }

            Evaluator.checkExpressionResult(exp, error, result, templateName, inlineContent, errorPrefix);
        }

        return result;
    }

    /**
     * @private
     */
    private evalByAdaptiveExpression(exp: string, scope: unknown): { value: unknown; error: string } {
        const parse: Expression = this.expressionParser.parse(exp);
        const opt = new Options();
        opt.nullSubstitution = this.lgOptions.nullSubstitution;
        opt.locale = this.lgOptions.locale;

        return parse.tryEvaluate(scope, opt);
    }

    // Genearte a new lookup function based on one lookup function
    private readonly customizedEvaluatorLookup = (baseLookup: EvaluatorLookup) => (
        name: string
    ): ExpressionEvaluator => {
        const standardFunction = baseLookup(name);

        if (standardFunction !== undefined) {
            return standardFunction;
        }

        const pointIndex = name.indexOf('.');
        if (pointIndex > 0) {
            const alias = name.substr(0, pointIndex);
            const realTemplate = this.templates.namedReferences[alias];
            if (realTemplate) {
                const realTemplateName = name.substr(pointIndex + 1);
                return new ExpressionEvaluator(
                    realTemplateName,
                    FunctionUtils.apply(this.evaluateWithTemplates(realTemplateName, realTemplate)),
                    ReturnType.Object
                );
            }
        }

        if (name.startsWith('lg.')) {
            name = name.substring(3);
        }

        const templateName = this.parseTemplateName(name).pureTemplateName;
        if (templateName in this.templateMap) {
            return new ExpressionEvaluator(
                templateName,
                FunctionUtils.apply(this.templateEvaluator(name)),
                ReturnType.Object,
                this.validTemplateReference
            );
        }

        if (name === Evaluator.templateFunctionName) {
            return new ExpressionEvaluator(
                Evaluator.templateFunctionName,
                FunctionUtils.apply(this.templateFunction()),
                ReturnType.Object,
                this.validateTemplateFunction
            );
        }

        if (Templates.enableFromFile) {
            if (name === Evaluator.fromFileFunctionName) {
                return new ExpressionEvaluator(
                    Evaluator.fromFileFunctionName,
                    FunctionUtils.apply(this.fromFile()),
                    ReturnType.Object,
                    (expr): void => FunctionUtils.validateOrder(expr, [ReturnType.String], ReturnType.String)
                );
            }
        }

        if (name === Evaluator.activityAttachmentFunctionName) {
            return new ExpressionEvaluator(
                Evaluator.activityAttachmentFunctionName,
                FunctionUtils.apply(this.activityAttachment()),
                ReturnType.Object,
                (expr): void => FunctionUtils.validateOrder(expr, undefined, ReturnType.Object, ReturnType.String)
            );
        }

        if (name === Evaluator.isTemplateFunctionName) {
            return new ExpressionEvaluator(
                Evaluator.isTemplateFunctionName,
                FunctionUtils.apply(this.isTemplate()),
                ReturnType.Boolean,
                FunctionUtils.validateUnaryString
            );
        }

        if (name === Evaluator.expandTextFunctionName) {
            return new ExpressionEvaluator(
                Evaluator.expandTextFunctionName,
                FunctionUtils.apply(this.expandText()),
                ReturnType.Object,
                FunctionUtils.validateUnaryString
            );
        }

        return undefined;
    };

    private readonly isTemplate = () => (args: readonly unknown[]): boolean => {
        const templateName = args[0].toString();
        return templateName in this.templateMap;
    };

    private readonly fromFile = () => (args: readonly unknown[]): unknown => {
        const filePath: string = TemplateExtensions.normalizePath(args[0].toString());
        const resourcePath: string = this.getResourcePath(filePath);
        let format = FileFormat.Evaluated;
        if (args.length > 1) {
            const expected = args[1].toString().toLowerCase();
            const currentFormat = Object.values(FileFormat).find((f) => f.toLowerCase() === expected);
            if (currentFormat != null) {
                format = currentFormat;
            }
        }

        let result: unknown;
        if (format === FileFormat.Binary) {
            result = fs.readFileSync(resourcePath);
        } else if (format === FileFormat.Raw) {
            result = fs.readFileSync(resourcePath, 'utf-8');
        } else {
            const stringContent = fs.readFileSync(resourcePath, 'utf-8');

            const newScope = this.evaluationTargetStack.length > 0 ? this.currentTarget().scope : undefined;
            const newTemplates = new Templates(
                this.templates.allTemplates,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                this.expressionParser,
                undefined,
                [],
                undefined,
                this.templates.namedReferences
            );
            result = newTemplates.evaluateText(stringContent, newScope, this.lgOptions);
        }

        return result;
    };

    private readonly expandText = () => (args: readonly unknown[]): unknown => {
        const stringContent = args[0].toString();

        const newScope = this.evaluationTargetStack.length > 0 ? this.currentTarget().scope : undefined;
        const newTemplates = new Templates(
            this.templates.allTemplates,
            undefined,
            undefined,
            undefined,
            undefined,
            undefined,
            this.expressionParser,
            undefined,
            [],
            undefined,
            this.templates.namedReferences
        );
        return newTemplates.evaluateText(stringContent, newScope, this.lgOptions);
    };

    /**
     * @private
     */
    private getResourcePath(filePath: string): string {
        let resourcePath: string;
        if (path.isAbsolute(filePath)) {
            resourcePath = filePath;
        } else {
            // relative path is not support in broswer environment
            const inBrowser: boolean = typeof window !== 'undefined';
            if (inBrowser) {
                throw new Error('relative path is not support in browser.');
            }
            const template: Template = this.templateMap[this.currentTarget().templateName];
            const sourcePath: string = TemplateExtensions.normalizePath(template.sourceRange.source);
            let baseFolder: string = __dirname;
            if (path.isAbsolute(sourcePath)) {
                baseFolder = path.dirname(sourcePath);
            }

            resourcePath = path.join(baseFolder, filePath);
        }

        return resourcePath;
    }

    private readonly activityAttachment = () => (args: readonly unknown[]): unknown => {
        return {
            [Evaluator.LGType]: 'attachment',
            contenttype: args[1].toString(),
            content: args[0],
        };
    };

    private readonly evaluateWithTemplates = (templateName: string, templates: Templates) => (
        args: readonly unknown[]
    ): unknown => {
        const newScope = this.constructScope(templateName, args.slice(0), templates.allTemplates);

        return templates.evaluate(templateName, newScope);
    };

    private readonly templateFunction = () => (args: readonly unknown[]): unknown => {
        const templateName: string = args[0].toString();
        const newScope = this.constructScope(templateName, args.slice(1), this.templates.allTemplates);

        return this.evaluateTemplate(templateName, newScope);
    };

    private readonly validateTemplateFunction = (expression: Expression): void => {
        FunctionUtils.validateAtLeastOne(expression);

        const children0: Expression = expression.children[0];

        // Validate return type
        if ((children0.returnType & ReturnType.Object) === 0 && (children0.returnType & ReturnType.String) === 0) {
            throw new Error(TemplateErrors.invalidTemplateNameType);
        }

        // Validate more if the name is string constant
        if (children0.type === ExpressionType.Constant) {
            const templateName: string = (children0 as Constant).value;
            this.checkTemplateReference(templateName, expression.children.slice(1));
        }
    };

    /**
     * @private
     */
    private checkTemplateReference(templateName: string, children: Expression[]): void {
        if (!(templateName in this.templateMap)) {
            throw new Error(TemplateErrors.templateNotExist(templateName));
        }

        const expectedArgsCount = this.templateMap[templateName].parameters.length;
        const actualArgsCount = children.length;

        if (actualArgsCount !== 0 && expectedArgsCount !== actualArgsCount) {
            throw new Error(TemplateErrors.argumentMismatch(templateName, expectedArgsCount, actualArgsCount));
        }
    }

    private readonly templateEvaluator = (templateName: string) => (args: readonly unknown[]): unknown => {
        const newScope = this.constructScope(templateName, Array.from(args), this.templates.allTemplates);

        return this.evaluateTemplate(templateName, newScope);
    };

    private readonly validTemplateReference = (expression: Expression): void => {
        return this.checkTemplateReference(expression.type, expression.children);
    };

    /**
     * @private
     */
    private parseTemplateName(templateName: string): { reExecute: boolean; pureTemplateName: string } {
        if (!templateName) {
            throw new Error('template name is empty.');
        }

        if (templateName.endsWith(Evaluator.ReExecuteSuffix)) {
            return {
                reExecute: true,
                pureTemplateName: templateName.substr(0, templateName.length - Evaluator.ReExecuteSuffix.length),
            };
        } else {
            return { reExecute: false, pureTemplateName: templateName };
        }
    }
}
