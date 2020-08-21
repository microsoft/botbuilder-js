/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import { ParserRuleContext } from 'antlr4ts/ParserRuleContext';
import { EvaluatorLookup, Expression, ExpressionParser, ExpressionEvaluator, ReturnType, ExpressionType, Constant, FunctionUtils, Extensions } from 'adaptive-expressions';
import { keyBy } from 'lodash';
import { EvaluationTarget } from './evaluationTarget';
import { Evaluator } from './evaluator';
import * as path from 'path';
import * as fs from 'fs';
import * as lp from './generated/LGTemplateParser';
import { LGTemplateParserVisitor } from './generated/LGTemplateParserVisitor';
import { Template } from './template';
import { TemplateExtensions } from './templateExtensions';
import { CustomizedMemory } from './customizedMemory';
import { TemplateErrors } from './templateErrors';
import { EvaluationOptions } from './evaluationOptions';
import { Templates } from './templates';
/**
 * LG template expander.
 */
export class Expander extends AbstractParseTreeVisitor<string[]> implements LGTemplateParserVisitor<any[]> {
    /**
     * Templates.
     */
    public readonly templates: Template[];

    /**
     * Expander expression parser
     */
    private readonly expanderExpressionParser: ExpressionParser;

    /**
     * Evaluator expression parser
     */
    private readonly evaluatorExpressionParser: ExpressionParser;

    private readonly expressionParser: ExpressionParser;

    /**
     * TemplateMap.
     */
    public readonly templateMap: {[name: string]: Template};
    private readonly evaluationTargetStack: EvaluationTarget[] = [];
    private readonly lgOptions: EvaluationOptions;

    public constructor(templates: Template[], expressionParser: ExpressionParser, opt: EvaluationOptions = undefined) {
        super();
        this.templates = templates;
        this.templateMap = keyBy(templates, (t: Template): string => t.name);
        this.lgOptions = opt;

        this.expressionParser = expressionParser;
        // generate a new customzied expression parser by injecting the template as functions
        this.expanderExpressionParser = new ExpressionParser(this.customizedEvaluatorLookup(expressionParser.EvaluatorLookup, true));
        this.evaluatorExpressionParser = new ExpressionParser(this.customizedEvaluatorLookup(expressionParser.EvaluatorLookup, false));
    }

    /**
     * Expand the results of a template with given name and scope.
     * @param templateName Given template name.
     * @param scope Given scope.
     * @returns All possiable results.
     */
    public expandTemplate(templateName: string, scope: any): any[] {
        const memory = scope instanceof CustomizedMemory ? scope : new CustomizedMemory(scope);
        if (!(templateName in this.templateMap)) {
            throw new Error(TemplateErrors.templateNotExist(templateName));
        }

        const templateTarget: EvaluationTarget = new EvaluationTarget(templateName, memory);
        const currentEvulateId: string = templateTarget.getId();

        if (this.evaluationTargetStack.find((u: EvaluationTarget): boolean => u.getId() === currentEvulateId)) {
            throw new Error(`${ TemplateErrors.loopDetected } ${ this.evaluationTargetStack.reverse()
                .map((u: EvaluationTarget): string => u.templateName)
                .join(' => ') }`);
        }

        // Using a stack to track the evalution trace
        this.evaluationTargetStack.push(templateTarget);
        const result: any[] = this.visit(this.templateMap[templateName].templateBodyParseTree);
        this.evaluationTargetStack.pop();

        return result;
    }

    public visitNormalBody(ctx: lp.NormalBodyContext): any[] {
        return this.visit(ctx.normalTemplateBody());
    }

    public visitNormalTemplateBody(ctx: lp.NormalTemplateBodyContext): any[] {
        const normalTemplateStrs: lp.TemplateStringContext[] = ctx.templateString();
        let result: any[] = [];
        for (const normalTemplateStr of normalTemplateStrs) {
            result = result.concat(this.visit(normalTemplateStr.normalTemplateString()));
        }

        return result;
    }

    public visitIfElseBody(ctx: lp.IfElseBodyContext): any[] {
        const ifRules: lp.IfConditionRuleContext[] = ctx.ifElseTemplateBody().ifConditionRule();
        for (const ifRule of ifRules) {
            if (this.evalCondition(ifRule.ifCondition()) && ifRule.normalTemplateBody() !== undefined) {
                return this.visit(ifRule.normalTemplateBody());
            }
        }

        return undefined;
    }

    public visitStructuredBody(ctx: lp.StructuredBodyContext): any[] {
        const templateRefValues: Map<string, any> = new Map<string, any>();
        const stb: lp.StructuredTemplateBodyContext = ctx.structuredTemplateBody();
        const result: any = {};
        const typeName: string = stb.structuredBodyNameLine().STRUCTURE_NAME().text.trim();
        result.lgType = typeName;
        let expandedResult: any[] = [result];
        const bodys = stb.structuredBodyContentLine();
        for (const body  of bodys) {
            const isKVPairBody = body.keyValueStructureLine() !== undefined;
            if (isKVPairBody) {
                const property = body.keyValueStructureLine().STRUCTURE_IDENTIFIER().text.toLowerCase();
                const value = this.visitStructureValue(body.keyValueStructureLine());
                if (value.length > 1) {
                    const valueList = [];
                    for (const item of value) {
                        const id = TemplateExtensions.newGuid();
                        if (item.length > 0) {
                            valueList.push(id);
                            templateRefValues.set(id, item);
                        } else {
                            valueList.push([])
                        }
                    }

                    expandedResult.forEach((x: any) => x[property] = valueList);
                } else {
                    const id = TemplateExtensions.newGuid();
                    if (value[0].length > 0) {
                        expandedResult.forEach((x: any) => x[property] = id);
                        templateRefValues.set(id, value[0]);
                    } else {
                        expandedResult.forEach((x: any) => x[property] = []);
                    }
                }
            } else {
                const propertyObjects: object[] = [];
                this.evalExpression(body.expressionInStructure().text, body.expressionInStructure(), body.text).forEach((x): number => propertyObjects.push(x));
                const tempResult = [];
                for (const res of expandedResult) {
                    for (const propertyObject of propertyObjects) {
                        const tempRes = JSON.parse(JSON.stringify(res));

                        // Full reference to another structured template is limited to the structured template with same type
                        if (typeof propertyObject === 'object' && Evaluator.LGType in propertyObject && propertyObject[Evaluator.LGType].toString() === typeName) {
                            for (const key of Object.keys(propertyObject)) {
                                if (propertyObject.hasOwnProperty(key) && !(key in tempRes)) {
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

        const exps: any[] = expandedResult;

        let finalResult: any[] = exps;
        for (const templateRefValueKey of templateRefValues.keys()) {
            const tempRes: any[] = [];
            for (const res of finalResult) {
                for (const refValue of templateRefValues.get(templateRefValueKey)) {
                    tempRes.push(JSON.parse(JSON.stringify(res).replace(templateRefValueKey, refValue.toString().replace(/\"/g, '\\\"'))));
                }
            }

            finalResult = tempRes;
        }

        return finalResult;
    }

    private visitStructureValue(ctx: lp.KeyValueStructureLineContext): any[] {
        const values = ctx.keyValueStructureValue();

        let result: any[] = [];
        for (const item of values) {
            if (TemplateExtensions.isPureExpression(item)) {
                result.push(this.evalExpression(item.expressionInStructure(0).text, item.expressionInStructure(0), ctx.text));
            } else {
                let itemStringResult = [''];
                for (const child of item.children) {
                    if (child instanceof lp.ExpressionInStructureContext) {
                        const errorPrefix = `Property '${ ctx.STRUCTURE_IDENTIFIER().text }':`;
                        itemStringResult =this.stringArrayConcat(itemStringResult, this.evalExpression(child.text, child, ctx.text, errorPrefix));
                    } else {
                        const node = child as TerminalNode;
                        switch (node.symbol.type) {
                            case (lp.LGTemplateParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY):
                                itemStringResult = this.stringArrayConcat(itemStringResult, [TemplateExtensions.evalEscape(node.text.replace(/\\\|/g, '|'))]);
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

    public visitSwitchCaseBody(ctx: lp.SwitchCaseBodyContext): any[] {
        const switchcaseNodes: lp.SwitchCaseRuleContext[] = ctx.switchCaseTemplateBody().switchCaseRule();
        const length: number = switchcaseNodes.length;
        const switchNode: lp.SwitchCaseRuleContext = switchcaseNodes[0];
        const switchExprs = switchNode.switchCaseStat().expression();
        const switchErrorPrefix = `Switch '${ switchExprs[0].text }': `;
        const switchExprResult = this.evalExpression(switchExprs[0].text, switchExprs[0], switchcaseNodes[0].switchCaseStat().text, switchErrorPrefix);
        let idx = 0;
        for (const caseNode of switchcaseNodes) {
            if (idx === 0) {
                idx++;
                continue; //skip the first node which is a switch statement
            }

            if (idx === length - 1 && caseNode.switchCaseStat().DEFAULT()) {
                const defaultBody: lp.NormalTemplateBodyContext = caseNode.normalTemplateBody();
                if (defaultBody) {
                    return this.visit(defaultBody);
                } else {
                    return undefined;
                }
            }

            const caseExprs = caseNode.switchCaseStat().expression();
            const caseErrorPrefix = `Case '${ caseExprs[0].text }': `;
            var caseExprResult = this.evalExpression(caseExprs[0].text, caseExprs[0], caseNode.switchCaseStat().text, caseErrorPrefix);
            //condition: check whether two string array have same elements
            if (switchExprResult.sort().toString() === caseExprResult.sort().toString()) {
                return this.visit(caseNode.normalTemplateBody());
            }

            idx++;
        }

        return undefined;
    }

    public visitNormalTemplateString(ctx: lp.NormalTemplateStringContext): any[] {
        var prefixErrorMsg = TemplateExtensions.getPrefixErrorMessage(ctx);
        let result: string[] = [''];
        for (const child of ctx.children) {
            if (child instanceof lp.ExpressionContext) {
                result = this.stringArrayConcat(result, this.evalExpression(child.text, child, ctx.text, prefixErrorMsg));
            } else {
                const node =  child as TerminalNode;
                switch (node.symbol.type) {
                    case lp.LGTemplateParser.MULTILINE_PREFIX:
                    case lp.LGTemplateParser.MULTILINE_SUFFIX:
                    case lp.LGTemplateParser.DASH:
                        break;
                    case lp.LGTemplateParser.ESCAPE_CHARACTER:
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

    public constructScope(templateName: string, args: any[]): any {
        const parameters: string[] = this.templateMap[templateName].parameters;

        if (args.length === 0) {
            // no args to construct, inherit from current scope
            return this.currentTarget().scope;
        }

        const newScope: any = {};
        parameters.map((e: string, i: number): any => newScope[e] = args[i]);

        return newScope;
    }

    protected defaultResult(): string[] {
        return [];
    }

    private currentTarget(): EvaluationTarget {
        return this.evaluationTargetStack[this.evaluationTargetStack.length - 1];
    }

    private evalCondition(condition: lp.IfConditionContext): boolean {
        const expression = condition.expression()[0];
        if (!expression) {
            return true;    // no expression means it's else
        }

        if (this.evalExpressionInCondition(expression, condition.text, `Condition '` + expression.text + `':`)) {
            return true;
        }

        return false;
    }

    private evalExpressionInCondition(expressionContext: ParserRuleContext, contentLine: string, errorPrefix: string = ''): boolean {
        const exp = TemplateExtensions.trimExpression(expressionContext.text);
        let result: any;
        let error: string;
        ({value: result, error: error} = this.evalByAdaptiveExpression(exp, this.currentTarget().scope));

        if (this.lgOptions.strictMode && (error || !result))
        {
            const templateName = this.currentTarget().templateName;

            if (this.evaluationTargetStack.length > 0)
            {
                this.evaluationTargetStack.pop();
            }

            Evaluator.checkExpressionResult(exp, error, result, templateName, contentLine, errorPrefix);
        } else if (error || !result)
        {
            return false;
        }

        return true;
    }

    private evalExpression(exp: string, context: ParserRuleContext, inlineContent: string = '', errorPrefix: string = ''): any[] {
        exp = TemplateExtensions.trimExpression(exp);
        let result: any;
        let error: string;
        ({value: result, error: error} = this.evalByAdaptiveExpression(exp, this.currentTarget().scope));

        if (error || (result ===  undefined && this.lgOptions.strictMode))
        {
            const templateName = this.currentTarget().templateName;

            if (this.evaluationTargetStack.length > 0)
            {
                this.evaluationTargetStack.pop();
            }

            Evaluator.checkExpressionResult(exp, error, result, templateName, inlineContent, errorPrefix);
        } else if (result === undefined && !this.lgOptions.strictMode)
        {
            result = `null`;
        }

        if (Array.isArray(result))
        {
            return result;
        }

        return [ result.toString() ];
    }

    private evalByAdaptiveExpression(exp: string, scope: any): any {
        const expanderExpression: Expression = this.expanderExpressionParser.parse(exp);
        const evaluatorExpression: Expression = this.evaluatorExpressionParser.parse(exp);
        const parse: Expression = this.reconstructExpression(expanderExpression, evaluatorExpression, false);

        return parse.tryEvaluate(scope);
    }

    private stringArrayConcat(array1: string[], array2: string[]): string[] {
        const result: string[] = [];
        for (const item1 of array1) {
            for (const item2 of array2) {
                result.push(item1.concat(item2));
            }
        }

        return result;
    }

    private readonly customizedEvaluatorLookup = (baseLookup: EvaluatorLookup, isExpander: boolean): any => (name: string): ExpressionEvaluator => {
        const standardFunction = baseLookup(name);

        if (standardFunction !== undefined) {
            return standardFunction;
        }
        
        if (name.startsWith('lg.')) {
            name = name.substring(3);
        }

        var templateName = this.parseTemplateName(name).pureTemplateName;
        if (templateName in this.templateMap) {
            if (isExpander) {
                return new ExpressionEvaluator(templateName, FunctionUtils.apply(this.templateExpander(name)), ReturnType.Object, this.validTemplateReference);
            } else {
                return new ExpressionEvaluator(templateName, FunctionUtils.apply(this.templateEvaluator(name)), ReturnType.Object, this.validTemplateReference);
            }
        }

        if (name === Evaluator.templateFunctionName) {
            return new ExpressionEvaluator(Evaluator.templateFunctionName, FunctionUtils.apply(this.templateFunction()), ReturnType.Object, this.validateTemplateFunction);
        }

        if (name === Evaluator.fromFileFunctionName) {
            return new ExpressionEvaluator(Evaluator.fromFileFunctionName, FunctionUtils.apply(this.fromFile()), ReturnType.Object, FunctionUtils.validateUnaryString);
        }

        if (name === Evaluator.activityAttachmentFunctionName) {
            return new ExpressionEvaluator(
                Evaluator.activityAttachmentFunctionName, 
                FunctionUtils.apply(this.activityAttachment()), 
                ReturnType.Object, 
                (expr): void => FunctionUtils.validateOrder(expr, undefined, ReturnType.Object, ReturnType.String));
        }

        if (name === Evaluator.isTemplateFunctionName) {
            return new ExpressionEvaluator(Evaluator.isTemplateFunctionName, FunctionUtils.apply(this.isTemplate()), ReturnType.Boolean, FunctionUtils.validateUnaryString);
        }

        if (name === Evaluator.expandTextFunctionName) {
            return new ExpressionEvaluator(Evaluator.expandTextFunctionName, FunctionUtils.apply(this.expandText()), ReturnType.Object, FunctionUtils.validateUnaryString);
        }

        return undefined;
    }

    private readonly templateEvaluator = (templateName: string): any => (args: readonly any[]): any => {
        const newScope: any = this.constructScope(templateName, Array.from(args));

        const value: string[] = this.expandTemplate(templateName, newScope);
        const randomNumber = Extensions.randomNext(this.currentTarget().scope, 0, value.length);

        return value[randomNumber];
    }

    private readonly templateExpander = (templateName: string): any => (args: readonly any[]): any[] => {
        const newScope: any = this.constructScope(templateName, Array.from(args));

        return this.expandTemplate(templateName, newScope);
    }

    private reconstructExpression(expanderExpression: Expression, evaluatorExpression: Expression, foundPrebuiltFunction: boolean): Expression {
        if (this.templateMap[expanderExpression.type]) {
            if (foundPrebuiltFunction) {
                return evaluatorExpression;
            }
        } else {
            foundPrebuiltFunction = true;
        }

        for (let i = 0; i < expanderExpression.children.length; i++) {
            expanderExpression.children[i] = this.reconstructExpression(expanderExpression.children[i], evaluatorExpression.children[i], foundPrebuiltFunction);
        }

        return expanderExpression;
    }

    private readonly isTemplate = (): any => (args: readonly any[]): boolean => {
        const templateName = args[0].toString();
        return templateName in this.templateMap;
    }

    private readonly fromFile = (): any => (args: readonly any[]): any => {
        const filePath: string = TemplateExtensions.normalizePath(args[0].toString());
        const resourcePath: string = this.getResourcePath(filePath);
        const stringContent = fs.readFileSync(resourcePath, 'utf-8');

        const newScope = this.evaluationTargetStack.length > 0 ? this.currentTarget().scope : undefined;
        const newTemplates = new Templates(this.templates, undefined, undefined, undefined, undefined, undefined, this.expressionParser);
        return newTemplates.evaluateText(stringContent, newScope, this.lgOptions);
    }

    private readonly expandText = (): any => (args: readonly any[]): any => {
        const stringContent = args[0].ToString();

        const newScope = this.evaluationTargetStack.length > 0 ? this.currentTarget().scope : undefined;
        const newTemplates = new Templates(this.templates, undefined, undefined, undefined, undefined, undefined, this.expressionParser);
        return newTemplates.evaluateText(stringContent, newScope, this.lgOptions);
    }

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

    private readonly activityAttachment = (): any => (args: readonly any[]): any => {
        return {
            [Evaluator.LGType]: 'attachment',
            contenttype: args[1].toString(),
            content: args[0]
        };
    }

    private readonly templateFunction = (): any => (args: readonly any[]): any[] => {
        const templateName: string = args[0];
        const newScope: any = this.constructScope(templateName, args.slice(1));
        const value: any[] = this.expandTemplate(templateName, newScope);

        return value;
    }

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
    }

    private checkTemplateReference(templateName: string, children: Expression[]): void{
        if (!(templateName in this.templateMap))
        {
            throw new Error(TemplateErrors.templateNotExist(templateName));
        }

        var expectedArgsCount = this.templateMap[templateName].parameters.length;
        var actualArgsCount = children.length;

        if (actualArgsCount !== 0 && expectedArgsCount !== actualArgsCount)
        {
            throw new Error(TemplateErrors.argumentMismatch(templateName, expectedArgsCount, actualArgsCount));
        }
    }

    private readonly validTemplateReference = (expression: Expression): void => {
        return this.checkTemplateReference(expression.type, expression.children);
    }

    private parseTemplateName(templateName: string): { reExecute: boolean; pureTemplateName: string } {
        if (!templateName) {
            throw new Error('template name is empty.');
        }

        if (templateName.endsWith(Evaluator.ReExecuteSuffix)) {
            return {reExecute:true, pureTemplateName: templateName.substr(0, templateName.length - Evaluator.ReExecuteSuffix.length)};
        } else {
            return {reExecute:false, pureTemplateName: templateName};
        }
    }
}
