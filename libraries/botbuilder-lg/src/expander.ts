/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import { ParserRuleContext } from 'antlr4ts/ParserRuleContext';
import { ExpressionFunctions, EvaluatorLookup, Expression, ExpressionParser, ExpressionEvaluator, ReturnType, SimpleObjectMemory, ExpressionType, Constant } from 'adaptive-expressions';
import { keyBy } from 'lodash';
import { EvaluationTarget } from './evaluationTarget';
import { Evaluator } from './evaluator';
import * as path from 'path';
import * as fs from 'fs';
import * as lp from './generated/LGFileParser';
import { LGFileParserVisitor } from './generated/LGFileParserVisitor';
import { Template } from './template';
import { TemplateExtensions } from './templateExtensions';
import { CustomizedMemory } from './customizedMemory';
import { TemplateErrors } from './templateErrors';

/**
 * LG template expander.
 */
export class Expander extends AbstractParseTreeVisitor<string[]> implements LGFileParserVisitor<string[]> {
    /**
     * Templates.
     */
    public readonly templates: Template[];

    /**
     * TemplateMap.
     */
    public readonly templateMap: {[name: string]: Template};
    private readonly evaluationTargetStack: EvaluationTarget[] = [];
    private readonly expanderExpressionParser: ExpressionParser;
    private readonly evaluatorExpressionParser: ExpressionParser;
    private readonly strictMode: boolean;

    public constructor(templates: Template[], expressionParser: ExpressionParser, strictMode: boolean = false) {
        super();
        this.templates = templates;
        this.templateMap = keyBy(templates, (t: Template): string => t.name);
        this.strictMode = strictMode;

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
    public expandTemplate(templateName: string, scope: any): string[] {
        if (!(templateName in this.templateMap)) {
            throw new Error(TemplateErrors.templateNotExist(templateName));
        }

        if (this.evaluationTargetStack.find((u: EvaluationTarget): boolean => u.templateName === templateName)) {
            throw new Error(`${ TemplateErrors.loopDetected } ${ this.evaluationTargetStack.reverse()
                .map((u: EvaluationTarget): string => u.templateName)
                .join(' => ') }`);
        }

        if (!(scope instanceof CustomizedMemory)) {
            scope = new CustomizedMemory(SimpleObjectMemory.wrap(scope));
        }
        
        // Using a stack to track the evalution trace
        this.evaluationTargetStack.push(new EvaluationTarget(templateName, scope));
        const result: string[] = this.visit(this.templateMap[templateName].parseTree);
        this.evaluationTargetStack.pop();

        return result;
    }

    public visitTemplateDefinition(ctx: lp.TemplateDefinitionContext): string[] {
        const templateNameContext: lp.TemplateNameLineContext = ctx.templateNameLine();
        if (templateNameContext.templateName().text === this.currentTarget().templateName) {
            return this.visit(ctx.templateBody());
        }

        return undefined;
    }

    public visitNormalBody(ctx: lp.NormalBodyContext): string[] {
        return this.visit(ctx.normalTemplateBody());
    }

    public visitNormalTemplateBody(ctx: lp.NormalTemplateBodyContext): string[] {
        const normalTemplateStrs: lp.TemplateStringContext[] = ctx.templateString();
        let result: string[] = [];
        for (const normalTemplateStr of normalTemplateStrs) {
            result = result.concat(this.visit(normalTemplateStr.normalTemplateString()));
        }

        return result;
    }

    public visitIfElseBody(ctx: lp.IfElseBodyContext): string[] {
        const ifRules: lp.IfConditionRuleContext[] = ctx.ifElseTemplateBody().ifConditionRule();
        for (const ifRule of ifRules) {
            if (this.evalCondition(ifRule.ifCondition())) {
                return this.visit(ifRule.normalTemplateBody());
            }
        }

        return undefined;
    }

    public visitStructuredBody(ctx: lp.StructuredBodyContext): string[] {
        const templateRefValues: Map<string, string> = new Map<string, string>();
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
                        valueList.push(id);
                        templateRefValues.set(id, item);
                    }

                    expandedResult.forEach((x): any[] => x[property] = valueList);
                } else {
                    const id = TemplateExtensions.newGuid();
                    expandedResult.forEach((x): string => x[property] = id);
                    templateRefValues.set(id, value[0]);
                }
            } else {
                const propertyObjects: object[] = [];
                this.evalExpression(body.objectStructureLine().text, body.objectStructureLine()).forEach((x): number => propertyObjects.push(JSON.parse(x)));
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

        const exps: string[] = expandedResult.map((x: string): string => JSON.stringify(x));

        let finalResult: string[] = exps;
        for (const templateRefValueKey of templateRefValues.keys()) {
            const tempRes: string[] = [];
            for (const res of finalResult) {
                for (const refValue of templateRefValues.get(templateRefValueKey)) {
                    tempRes.push(res.replace(templateRefValueKey, refValue));
                }
            }

            finalResult = tempRes;
        }

        return finalResult;
    }

    private visitStructureValue(ctx: lp.KeyValueStructureLineContext): string[] {
        const values = ctx.keyValueStructureValue();

        let result: any[] = [];
        for (const item of values) {
            if (TemplateExtensions.isPureExpression(item).hasExpr) {
                result.push(this.evalExpression(TemplateExtensions.isPureExpression(item).expression, ctx));
            } else {
                let itemStringResult = [''];
                for (const node of item.children) {
                    switch ((node as TerminalNode).symbol.type) {
                        case (lp.LGFileParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY):
                            itemStringResult = this.stringArrayConcat(itemStringResult, [TemplateExtensions.evalEscape(node.text)]);
                            break;
                        case (lp.LGFileParser.EXPRESSION_IN_STRUCTURE_BODY):
                            const errorPrefix = `Property '${ ctx.STRUCTURE_IDENTIFIER().text }':`;
                            itemStringResult =this.stringArrayConcat(itemStringResult, this.evalExpression(node.text, ctx, errorPrefix));
                            break;
                        default:
                            itemStringResult = this.stringArrayConcat(itemStringResult, [node.text]);
                            break;
                    }
                }

                result.push(itemStringResult);
            }
        }

        return result;
    }

    public visitSwitchCaseBody(ctx: lp.SwitchCaseBodyContext): string[] {
        const switchcaseNodes: lp.SwitchCaseRuleContext[] = ctx.switchCaseTemplateBody().switchCaseRule();
        const length: number = switchcaseNodes.length;
        const switchNode: lp.SwitchCaseRuleContext = switchcaseNodes[0];
        const switchExprs: TerminalNode[] = switchNode.switchCaseStat().EXPRESSION();
        const switchErrorPrefix = `Switch '${ switchExprs[0].text }': `;
        const switchExprResult = this.evalExpression(switchExprs[0].text, switchcaseNodes[0].switchCaseStat(), switchErrorPrefix);
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

            const caseExprs: TerminalNode[] = caseNode.switchCaseStat().EXPRESSION();
            const caseErrorPrefix = `Case '${ caseExprs[0].text }': `;
            var caseExprResult = this.evalExpression(caseExprs[0].text, caseNode.switchCaseStat(), caseErrorPrefix);
            //condition: check whether two string array have same elements
            if (switchExprResult.sort().toString() === caseExprResult.sort().toString()) {
                return this.visit(caseNode.normalTemplateBody());
            }

            idx++;
        }

        return undefined;
    }

    public visitNormalTemplateString(ctx: lp.NormalTemplateStringContext): string[] {
        var prefixErrorMsg = TemplateExtensions.getPrefixErrorMessage(ctx);
        let result: string[] = [''];
        for (const node of ctx.children) {
            const innerNode: TerminalNode =  node as TerminalNode;
            switch (innerNode.symbol.type) {
                case lp.LGFileParser.MULTILINE_PREFIX:
                case lp.LGFileParser.MULTILINE_SUFFIX:
                case lp.LGFileParser.DASH:
                    break;
                case lp.LGFileParser.ESCAPE_CHARACTER:
                    result = this.stringArrayConcat(result, [TemplateExtensions.evalEscape(innerNode.text)]);
                    break;
                case lp.LGFileParser.EXPRESSION: {
                    result = this.stringArrayConcat(result, this.evalExpression(innerNode.text, ctx, prefixErrorMsg));
                    break;
                }
                default: {
                    result = this.stringArrayConcat(result, [innerNode.text]);
                    break;
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
        const expression: TerminalNode = condition.EXPRESSION()[0];
        if (!expression) {
            return true;    // no expression means it's else
        }

        if (this.evalExpressionInCondition(expression.text, condition, `Condition '` + expression.text + `':`)) {
            return true;
        }

        return false;
    }

    private evalExpressionInCondition(exp: string, context?: ParserRuleContext, errorPrefix: string = ''): boolean {
        exp = TemplateExtensions.trimExpression(exp);
        let result: any;
        let error: string;
        ({value: result, error: error} = this.evalByAdaptiveExpression(exp, this.currentTarget().scope));

        if (this.strictMode && (error || !result))
        {
            let errorMsg = '';

            let childErrorMsg = '';
            if (error)
            {
                childErrorMsg += error;
            }
            else if (!result)
            {
                childErrorMsg += TemplateErrors.nullExpression(exp);
            }

            if (context)
            {
                errorMsg += TemplateErrors.errorExpression(context.text, this.currentTarget().templateName, errorPrefix);
            }

            if (this.evaluationTargetStack.length > 0)
            {
                this.evaluationTargetStack.pop();
            }

            throw new Error(childErrorMsg + errorMsg);
        } else if (error || !result)
        {
            return false;
        }

        return true;
    }

    private evalExpression(exp: string, context: ParserRuleContext, errorPrefix: string = ''): string[] {
        exp = TemplateExtensions.trimExpression(exp);
        let result: any;
        let error: string;
        ({value: result, error: error} = this.evalByAdaptiveExpression(exp, this.currentTarget().scope));

        if (error || (result ===  undefined && this.strictMode))
        {
            let errorMsg = '';

            let childErrorMsg = '';
            if (error)
            {
                childErrorMsg += error;
            }
            else if (result === undefined)
            {
                childErrorMsg += TemplateErrors.nullExpression(exp);
            }

            if (context !== undefined)
            {
                errorMsg += TemplateErrors.errorExpression(context.text, this.currentTarget().templateName, errorPrefix);
            }

            if (this.evaluationTargetStack.length > 0)
            {
                this.evaluationTargetStack.pop();
            }

            throw new Error(childErrorMsg + errorMsg);
        } else if (result === undefined && !this.strictMode)
        {
            result = `null`;
        }

        if (Array.isArray(result))
        {
            return result.map((u): string => u.toString());
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
                return new ExpressionEvaluator(templateName, ExpressionFunctions.apply(this.templateExpander(name)), ReturnType.Object, this.validTemplateReference);
            } else {
                return new ExpressionEvaluator(templateName, ExpressionFunctions.apply(this.templateEvaluator(name)), ReturnType.Object, this.validTemplateReference);
            }
        }

        if (name === Evaluator.templateFunctionName) {
            return new ExpressionEvaluator(Evaluator.templateFunctionName, ExpressionFunctions.apply(this.templateFunction()), ReturnType.Object, this.validateTemplateFunction);
        }

        if (name === Evaluator.fromFileFunctionName) {
            return new ExpressionEvaluator(Evaluator.fromFileFunctionName, ExpressionFunctions.apply(this.fromFile()), ReturnType.Object, ExpressionFunctions.validateUnaryString);
        }

        if (name === Evaluator.activityAttachmentFunctionName) {
            return new ExpressionEvaluator(
                Evaluator.activityAttachmentFunctionName, 
                ExpressionFunctions.apply(this.activityAttachment()), 
                ReturnType.Object, 
                (expr): void => ExpressionFunctions.validateOrder(expr, undefined, ReturnType.Object, ReturnType.String));
        }

        if (name === Evaluator.isTemplateFunctionName) {
            return new ExpressionEvaluator(Evaluator.isTemplateFunctionName, ExpressionFunctions.apply(this.isTemplate()), ReturnType.Boolean, ExpressionFunctions.validateUnaryString);
        }

        return undefined;
    }

    private readonly templateEvaluator = (templateName: string): any => (args: readonly any[]): string => {
        const newScope: any = this.constructScope(templateName, Array.from(args));

        const value: string[] = this.expandTemplate(templateName, newScope);
        const randomNumber: number = Math.floor(Math.random() * value.length);

        return value[randomNumber];
    }

    private readonly templateExpander = (templateName: string): any => (args: readonly any[]): string[] => {
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

        // TODO
        return stringContent;
        //const result = this.wrappedEvalTextContainsExpression(stringContent, Evaluator.expressionRecognizeReverseRegex);
        //return TemplateExtensions.evalEscape(result);
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
            const sourcePath: string = TemplateExtensions.normalizePath(template.source);
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

    private readonly templateFunction = (): any => (args: readonly any[]): any => {
        const templateName: string = args[0];
        const newScope: any = this.constructScope(templateName, args.slice(1));

        const value: string[] = this.expandTemplate(templateName, newScope);
        const randomNumber: number = Math.floor(Math.random() * value.length);

        return value[randomNumber];
    }

    private readonly validateTemplateFunction = (expression: Expression): void => {
        
        ExpressionFunctions.validateAtLeastOne(expression);

        const children0: Expression = expression.children[0];

        // Validate return type
        if (children0.returnType !== ReturnType.Object && children0.returnType !== ReturnType.String) {
            throw new Error(TemplateErrors.errorTemplateNameformat(children0.toString()));
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
