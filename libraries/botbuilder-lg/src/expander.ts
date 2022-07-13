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
import { EvaluationOptions } from './evaluationOptions';
import { EvaluationTarget } from './evaluationTarget';
import { Evaluator, FileFormat } from './evaluator';
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
    ValueWithError,
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
    StructuredBodyContext,
    StructuredTemplateBodyContext,
    SwitchCaseBodyContext,
    SwitchCaseRuleContext,
    TemplateStringContext,
} from './generated/LGTemplateParser';

/**
 * LG template expander.
 */
export class Expander extends AbstractParseTreeVisitor<unknown[]> implements LGTemplateParserVisitor<unknown[]> {
    /**
     * Templates.
     */
    readonly templates: Templates;

    /**
     * Expander expression parser
     */
    private readonly expanderExpressionParser: ExpressionParser;

    /**
     * Evaluator expression parser
     */
    private readonly evaluatorExpressionParser: ExpressionParser;

    /**
     * TemplateMap.
     */
    readonly templateMap: { [name: string]: Template };
    private readonly evaluationTargetStack: EvaluationTarget[] = [];
    private readonly lgOptions: EvaluationOptions;

    /**
     * Creates a new instance of the Expander class.
     *
     * @param templates Template list.
     * @param opt Options for LG.
     */
    constructor(templates: Templates, opt?: EvaluationOptions) {
        super();
        this.templates = templates;
        this.templateMap = keyBy(templates.allTemplates, (t: Template): string => t.name);
        this.lgOptions = opt;

        // Generate a new customized expression parser by injecting the template as functions.
        this.expanderExpressionParser = new ExpressionParser(
            this.customizedEvaluatorLookup(templates.expressionParser.EvaluatorLookup, true)
        );
        this.evaluatorExpressionParser = new ExpressionParser(
            this.customizedEvaluatorLookup(templates.expressionParser.EvaluatorLookup, false)
        );
    }

    /**
     * Expand the results of a template with given name and scope.
     *
     * @param templateName Given template name.
     * @param scope Given scope.
     * @returns All possiable results.
     */
    expandTemplate(templateName: string, scope: unknown): unknown[] {
        const memory = scope instanceof CustomizedMemory ? scope : new CustomizedMemory(scope);
        if (!(templateName in this.templateMap)) {
            throw new Error(TemplateErrors.templateNotExist(templateName));
        }

        const templateTarget: EvaluationTarget = new EvaluationTarget(templateName, memory);
        const currentEvulateId: string = templateTarget.getId();

        if (this.evaluationTargetStack.find((u: EvaluationTarget): boolean => u.getId() === currentEvulateId)) {
            throw new Error(
                `${TemplateErrors.loopDetected} ${this.evaluationTargetStack
                    .reverse()
                    .map((u: EvaluationTarget): string => u.templateName)
                    .join(' => ')}`
            );
        }

        // Using a stack to track the evalution trace
        this.evaluationTargetStack.push(templateTarget);
        const result: unknown[] = this.visit(this.templateMap[templateName].templateBodyParseTree);
        this.evaluationTargetStack.pop();

        return result;
    }

    /**
     * Visit a parse tree produced by the normalBody labeled alternative in LGTemplateParser.body.
     *
     * @param ctx The parse tree.
     * @returns The result of visiting the normal body.
     */
    visitNormalBody(ctx: NormalBodyContext): unknown[] {
        return this.visit(ctx.normalTemplateBody());
    }

    /**
     * Visit a parse tree produced by LGTemplateParser.normalTemplateBody.
     *
     * @param ctx The parse tree.
     * @returns The result of visiting the normal template body.
     */
    visitNormalTemplateBody(ctx: NormalTemplateBodyContext): unknown[] {
        const normalTemplateStrs: TemplateStringContext[] = ctx.templateString();
        let result: unknown[] = [];
        for (const normalTemplateStr of normalTemplateStrs) {
            result = result.concat(this.visit(normalTemplateStr.normalTemplateString()));
        }

        return result;
    }

    /**
     * Visit a parse tree produced by the ifElseBody labeled alternative in LGTemplateParser.body.
     *
     * @param ctx The parse tree.
     * @returns The result of visiting if-else body.
     */
    visitIfElseBody(ctx: IfElseBodyContext): unknown[] {
        const ifRules: IfConditionRuleContext[] = ctx.ifElseTemplateBody().ifConditionRule();
        for (const ifRule of ifRules) {
            if (this.evalCondition(ifRule.ifCondition()) && ifRule.normalTemplateBody() !== undefined) {
                return this.visit(ifRule.normalTemplateBody());
            }
        }

        return undefined;
    }

    /**
     * Visit a parse tree produced by LGTemplateParser.structuredBody.
     *
     * @param ctx The parse tree.
     * @returns The result of visiting the structured body.
     */
    visitStructuredBody(ctx: StructuredBodyContext): unknown[] {
        const templateRefValues: Map<string, unknown[]> = new Map<string, unknown[]>();
        const stb: StructuredTemplateBodyContext = ctx.structuredTemplateBody();
        const result: Record<string, unknown> = {};
        const typeName: string = stb.structuredBodyNameLine().STRUCTURE_NAME().text.trim();
        result.lgType = typeName;
        let expandedResult: Record<string, unknown>[] = [result];
        const bodys = stb.structuredBodyContentLine();
        for (const body of bodys) {
            const isKVPairBody = body.keyValueStructureLine() !== undefined;
            if (isKVPairBody) {
                const property = body.keyValueStructureLine().STRUCTURE_IDENTIFIER().text.toLowerCase();
                const value = this.visitStructureValue(body.keyValueStructureLine());
                if (value && value.length > 0) {
                    if (value.length > 1) {
                        const valueList = [];
                        for (const item of value) {
                            const id = TemplateExtensions.newGuid();
                            if (item.length > 0) {
                                valueList.push(id);
                                templateRefValues.set(id, item);
                            } else {
                                valueList.push([]);
                            }
                        }

                        expandedResult.forEach((x) => (x[property] = valueList));
                    } else {
                        const id = TemplateExtensions.newGuid();
                        if (value[0].length > 0) {
                            expandedResult.forEach((x) => (x[property] = id));
                            templateRefValues.set(id, value[0]);
                        } else {
                            expandedResult.forEach((x) => (x[property] = []));
                        }
                    }
                }
            } else {
                const propertyObjects: unknown[] = [];
                this.evalExpression(body.expressionInStructure().text, body.expressionInStructure(), body.text).forEach(
                    (x): void => {
                        if (x !== undefined && x !== null) {
                            propertyObjects.push(x);
                        }
                    }
                );
                const tempResult = [];
                for (const res of expandedResult) {
                    for (const propertyObject of propertyObjects) {
                        const tempRes = JSON.parse(JSON.stringify(res));

                        // Full reference to another structured template is limited to the structured template with same type
                        if (
                            typeof propertyObject === 'object' &&
                            Evaluator.LGType in propertyObject &&
                            propertyObject[Evaluator.LGType].toString() === typeName
                        ) {
                            for (const key of Object.keys(propertyObject)) {
                                if (Object.prototype.hasOwnProperty.call(propertyObject, key) && !(key in tempRes)) {
                                    tempRes[key] = propertyObject[key];
                                }
                            }
                        }

                        tempResult.push(tempRes);
                    }
                }

                expandedResult = tempResult;
            }
        }

        const exps = expandedResult;

        let finalResult = exps;
        for (const templateRefValueKey of templateRefValues.keys()) {
            const tempRes: Record<string, unknown>[] = [];
            for (const res of finalResult) {
                for (const refValue of templateRefValues.get(templateRefValueKey)) {
                    tempRes.push(
                        JSON.parse(
                            JSON.stringify(res).replace(templateRefValueKey, refValue.toString().replace(/"/g, '\\"'))
                        )
                    );
                }
            }

            finalResult = tempRes;
        }

        return finalResult;
    }

    /**
     * @private
     */
    private visitStructureValue(ctx: KeyValueStructureLineContext): unknown[][] {
        const values = ctx.keyValueStructureValue();

        const result: unknown[][] = [];
        for (const item of values) {
            if (TemplateExtensions.isPureExpression(item)) {
                result.push(
                    this.evalExpression(item.expressionInStructure(0).text, item.expressionInStructure(0), ctx.text)
                );
            } else {
                let itemStringResult: unknown[] = [''];
                for (const child of item.children) {
                    if (child instanceof ExpressionInStructureContext) {
                        const errorPrefix = `Property '${ctx.STRUCTURE_IDENTIFIER().text}':`;
                        itemStringResult = this.stringArrayConcat(
                            itemStringResult,
                            this.evalExpression(child.text, child, ctx.text, errorPrefix)
                        );
                    } else {
                        const node = child as TerminalNode;
                        switch (node.symbol.type) {
                            case LGTemplateParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY:
                                itemStringResult = this.stringArrayConcat(itemStringResult, [
                                    TemplateExtensions.evalEscape(node.text.replace(/\\\|/g, '|')),
                                ]);
                                break;
                            default:
                                itemStringResult = this.stringArrayConcat(itemStringResult, [node.text]);
                                break;
                        }
                    }
                }

                result.push(itemStringResult);
            }
        }

        return result;
    }

    /**
     * Visit a parse tree produced by the switchCaseBody labeled alternative in LGTemplateParser.body.
     *
     * @param ctx The parse tree.
     * @returns The result of visiting the switch case body.
     */
    visitSwitchCaseBody(ctx: SwitchCaseBodyContext): unknown[] {
        const switchcaseNodes: SwitchCaseRuleContext[] = ctx.switchCaseTemplateBody().switchCaseRule();
        const length: number = switchcaseNodes.length;
        const switchNode: SwitchCaseRuleContext = switchcaseNodes[0];
        const switchExprs = switchNode.switchCaseStat().expression();
        const switchErrorPrefix = `Switch '${switchExprs[0].text}': `;
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

            if (idx === length - 1 && caseNode.switchCaseStat().DEFAULT()) {
                const defaultBody: NormalTemplateBodyContext = caseNode.normalTemplateBody();
                if (defaultBody) {
                    return this.visit(defaultBody);
                } else {
                    return undefined;
                }
            }

            const caseExprs = caseNode.switchCaseStat().expression();
            const caseErrorPrefix = `Case '${caseExprs[0].text}': `;
            const caseExprResult = this.evalExpression(
                caseExprs[0].text,
                caseExprs[0],
                caseNode.switchCaseStat().text,
                caseErrorPrefix
            );
            if (FunctionUtils.commonEquals(switchExprResult[0], caseExprResult[0])) {
                return this.visit(caseNode.normalTemplateBody());
            }

            idx++;
        }

        return undefined;
    }

    /**
     * Visit a parse tree produced by LGTemplateParser.normalTemplateString.
     *
     * @param ctx The parse tree.
     * @returns The result of visiting NormalTemplateString.
     */
    visitNormalTemplateString(ctx: NormalTemplateStringContext): unknown[] {
        const prefixErrorMsg = TemplateExtensions.getPrefixErrorMessage(ctx);
        let result: unknown[] = [undefined];
        for (const child of ctx.children) {
            if (child instanceof ExpressionContext) {
                result = this.stringArrayConcat(
                    result,
                    this.evalExpression(child.text, child, ctx.text, prefixErrorMsg)
                );
            } else {
                const node = child as TerminalNode;
                switch (node.symbol.type) {
                    case LGTemplateParser.MULTILINE_PREFIX:
                    case LGTemplateParser.MULTILINE_SUFFIX:
                    case LGTemplateParser.DASH:
                        break;
                    case LGTemplateParser.ESCAPE_CHARACTER:
                        result = this.stringArrayConcat(result, [TemplateExtensions.evalEscape(node.text)]);
                        break;
                    default: {
                        result = this.stringArrayConcat(result, [node.text]);
                        break;
                    }
                }
            }
        }

        return result;
    }

    /**
     * Constructs the scope for mapping the values of arguments to the parameters of the template.
     *
     * @param inputTemplateName The template name to evaluate.
     * @param args Arguments to map to the template parameters.
     * @param allTemplates All templates.
     * @returns The current scope if the number of arguments is 0, otherwise, returns a CustomizedMemory.
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
     * Gets the default value returned by visitor methods.
     *
     * @returns Empty string array.
     */
    protected defaultResult(): string[] {
        return [];
    }

    /**
     * @private
     */
    private currentTarget(): EvaluationTarget {
        return this.evaluationTargetStack[this.evaluationTargetStack.length - 1];
    }

    /**
     * @private
     */
    private evalCondition(condition: IfConditionContext): boolean {
        const expression = condition.expression()[0];
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
    private evalExpression(exp: string, context: ParserRuleContext, inlineContent = '', errorPrefix = ''): unknown[] {
        exp = TemplateExtensions.trimExpression(exp);
        const { value: result, error: error } = this.evalByAdaptiveExpression(exp, this.currentTarget().scope);

        if (error || (result === undefined && this.lgOptions.strictMode)) {
            const templateName = this.currentTarget().templateName;

            if (this.evaluationTargetStack.length > 0) {
                this.evaluationTargetStack.pop();
            }

            Evaluator.checkExpressionResult(exp, error, result, templateName, inlineContent, errorPrefix);
        }

        if (Array.isArray(result)) {
            return result;
        }

        return [result];
    }

    /**
     * @private
     */
    private evalByAdaptiveExpression(exp: string, scope: unknown): ValueWithError {
        const expanderExpression: Expression = this.expanderExpressionParser.parse(exp);
        const evaluatorExpression: Expression = this.evaluatorExpressionParser.parse(exp);
        const parse: Expression = this.reconstructExpression(expanderExpression, evaluatorExpression, false);
        const opt = new Options();
        opt.nullSubstitution = this.lgOptions.nullSubstitution;
        opt.locale = this.lgOptions.locale;

        return parse.tryEvaluate(scope, opt);
    }

    /**
     * @private
     */
    private stringArrayConcat(array1: unknown[], array2: unknown[]): unknown[] {
        const result: unknown[] = [];
        for (const item1 of array1) {
            for (const item2 of array2) {
                if (item1 === undefined && item2 === undefined) {
                    result.push(undefined);
                } else {
                    result.push(this.stringConcat(item1, item2));
                }
            }
        }

        return result;
    }

    private stringConcat(str1: unknown, str2: unknown) {
        if (!str1) {
            str1 = '';
        }

        if (!str2) {
            str2 = '';
        }

        return str1.toString() + str2.toString();
    }

    private readonly customizedEvaluatorLookup = (baseLookup: EvaluatorLookup, isExpander: boolean) => (
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
            if (isExpander) {
                return new ExpressionEvaluator(
                    templateName,
                    FunctionUtils.apply(this.templateExpander(name)),
                    ReturnType.Object,
                    this.validTemplateReference
                );
            } else {
                return new ExpressionEvaluator(
                    templateName,
                    FunctionUtils.apply(this.templateEvaluator(name)),
                    ReturnType.Object,
                    this.validTemplateReference
                );
            }
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

    private readonly evaluateWithTemplates = (templateName: string, templates: Templates) => (
        args: readonly unknown[]
    ): unknown => {
        const newScope = this.constructScope(templateName, args.slice(0), templates.allTemplates);

        return templates.evaluate(templateName, newScope);
    };

    private readonly templateEvaluator = (templateName: string) => (args: readonly unknown[]): unknown => {
        const newScope = this.constructScope(templateName, Array.from(args), this.templates.allTemplates);

        const value = this.expandTemplate(templateName, newScope);
        const randomNumber = Extensions.randomNext(this.currentTarget().scope, 0, value.length);

        return value[randomNumber];
    };

    private readonly templateExpander = (templateName: string) => (args: readonly unknown[]): unknown[] => {
        const newScope = this.constructScope(templateName, Array.from(args), this.templates.allTemplates);

        return this.expandTemplate(templateName, newScope);
    };

    /**
     * @private
     */
    private reconstructExpression(
        expanderExpression: Expression,
        evaluatorExpression: Expression,
        foundPrebuiltFunction: boolean
    ): Expression {
        if (this.templateMap[expanderExpression.type]) {
            if (foundPrebuiltFunction) {
                return evaluatorExpression;
            }
        } else {
            foundPrebuiltFunction = true;
        }

        for (let i = 0; i < expanderExpression.children.length; i++) {
            expanderExpression.children[i] = this.reconstructExpression(
                expanderExpression.children[i],
                evaluatorExpression.children[i],
                foundPrebuiltFunction
            );
        }

        return expanderExpression;
    }

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
                this.templates.expressionParser,
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
            this.templates.expressionParser,
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

    private readonly activityAttachment = () => (args: readonly unknown[]): Record<string, unknown> => {
        return {
            [Evaluator.LGType]: 'attachment',
            contenttype: args[1].toString(),
            content: args[0],
        };
    };

    private readonly templateFunction = () => (args: readonly unknown[]): unknown[] => {
        const templateName: string = args[0].toString();
        const newScope = this.constructScope(templateName, args.slice(1), this.templates.allTemplates);
        const value = this.expandTemplate(templateName, newScope);

        return value;
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
