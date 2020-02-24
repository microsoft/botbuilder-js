/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line: no-submodule-imports
import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import { ParserRuleContext } from 'antlr4ts/ParserRuleContext';
import { ExpressionFunctions, Constant, EvaluatorLookup, Expression, ExpressionEngine, ExpressionEvaluator, ExpressionType, ReturnType, SimpleObjectMemory } from 'adaptive-expressions';
import { keyBy } from 'lodash';
import { CustomizedMemory } from './customizedMemory';
import { EvaluationTarget } from './evaluationTarget';
import * as lp from './generated/LGFileParser';
import { LGFileParserVisitor } from './generated/LGFileParserVisitor';
import { LGTemplate } from './lgTemplate';
import * as path from 'path';
import * as fs from 'fs';
import { LGExtensions } from './lgExtensions';
import { LGErrors } from './lgErrors';
/**
 * Evaluation tuntime engine
 */
// tslint:disable-next-line: max-classes-per-file
export class Evaluator extends AbstractParseTreeVisitor<any> implements LGFileParserVisitor<any> {

    /**
     * Templates.
     */
    public readonly templates: LGTemplate[];

    /**
     * Expression engine.
     */
    public readonly expressionEngine: ExpressionEngine;

    /**
     * TemplateMap.
     */
    public readonly templateMap: { [name: string]: LGTemplate };
    private readonly evaluationTargetStack: EvaluationTarget[] = [];
    private readonly strictMode: boolean;

    // to support broswer, use look-ahead replace look-behind
    // original:/(?<!\\)$\{((\'[^\'\r\n]*\')|(\"[^\"\r\n]*\")|(\`(\\\`|[^\`])*\`)|[^\r\n\{\}\'\"\`])*?\}/g;
    public static readonly expressionRecognizeReverseRegex: RegExp = new RegExp(/\}((\'[^\'\r\n]*\')|(\"[^\"\r\n]*\")|(\`(\\\`|[^\`])*\`)|([^\r\n\{\}\'\"\`]))*?\{\$(?!\\)/g);

    public static readonly LGType = 'lgType';
    public static readonly activityAttachmentFunctionName = 'ActivityAttachment';
    public static readonly fromFileFunctionName = 'fromFile';
    public static readonly templateFunctionName = 'template';
    public static readonly isTemplateFunctionName = 'isTemplate';
    private static readonly ReExecuteSuffix = '!';

    public constructor(templates: LGTemplate[], expressionEngine: ExpressionEngine, strictMode: boolean = false) {
        super();
        this.templates = templates;
        this.templateMap = keyBy(templates, (t: LGTemplate): string => t.name);
        this.strictMode = strictMode;

        // generate a new customzied expression engine by injecting the template as functions
        this.expressionEngine = new ExpressionEngine(this.customizedEvaluatorLookup(expressionEngine.EvaluatorLookup));
    }

    public static wrappedRegExSplit(inputString: string, regex: RegExp): string[] {
        return inputString.split('').reverse().join('').split(regex).map((e: string): string => e.split('').reverse().join('')).reverse();
    }

    /**
     * Evaluate a template with given name and scope.
     * @param inputTemplateName template name.
     * @param scope scope.
     * @returns Evaluate result.
     */
    public evaluateTemplate(inputTemplateName: string, scope: any): any {
        let templateName: string;
        let reExecute: boolean;
        ({reExecute, pureTemplateName: templateName} = this.parseTemplateName(inputTemplateName));

        if (!(templateName in this.templateMap)) {
            throw new Error(LGErrors.templateNotExist(templateName));
        }

        if (this.evaluationTargetStack.find((u: EvaluationTarget): boolean => u.templateName === templateName) !== undefined) {
            throw new Error(`${ LGErrors.loopDetected } ${ this.evaluationTargetStack.reverse()
                .map((u: EvaluationTarget): string => u.templateName)
                .join(' => ') }`);
        }

        if(!(scope instanceof CustomizedMemory)) {
            scope = new CustomizedMemory(SimpleObjectMemory.wrap(scope));
        }

        const templateTarget: EvaluationTarget = new EvaluationTarget(templateName, scope);
        const currentEvulateId: string = templateTarget.getId();

        let previousEvaluateTarget: EvaluationTarget;

        if (this.evaluationTargetStack.length !== 0) {
            previousEvaluateTarget = this.evaluationTargetStack[this.evaluationTargetStack.length - 1];
            if (!reExecute && previousEvaluateTarget.evaluatedChildren.has(currentEvulateId)) {
                return previousEvaluateTarget.evaluatedChildren.get(currentEvulateId);
            }
        }

        // Using a stack to track the evalution trace
        this.evaluationTargetStack.push(templateTarget);
        const result: string = this.visit(this.templateMap[templateName].parseTree);

        if (previousEvaluateTarget) {
            previousEvaluateTarget.evaluatedChildren.set(currentEvulateId, result);
        }

        this.evaluationTargetStack.pop();

        return result;
    }

    public visitStructuredTemplateBody(ctx: lp.StructuredTemplateBodyContext): any {
        const result: any = {};
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
                const propertyObject: any = this.evalExpression(body.objectStructureLine().text, body.objectStructureLine());
                // Full reference to another structured template is limited to the structured template with same type
                if (typeof propertyObject === 'object' && Evaluator.LGType in propertyObject &&  propertyObject[Evaluator.LGType].toString() === typeName) {
                    for (const key of Object.keys(propertyObject)) {
                        if (propertyObject.hasOwnProperty(key) && !(key in result)) {
                            result[key] = propertyObject[key];
                        }
                    }
                }
            }
        }

        return result;
    }

    private visitStructureValue(ctx: lp.KeyValueStructureLineContext): any {
        const values = ctx.keyValueStructureValue();

        const result = [];
        for(const item of values) {
            if (Evaluator.isPureExpression(item).hasExpr) {
                result.push(this.evalExpression(Evaluator.isPureExpression(item).expression, ctx));
            } else {
                let itemStringResult = '';
                for(const node of item.children) {
                    switch ((node as TerminalNode).symbol.type) {
                        case (lp.LGFileParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY): 
                            itemStringResult += this.evalEscape(node.text);
                            break;
                        
                        case (lp.LGFileParser.EXPRESSION_IN_STRUCTURE_BODY):
                            const errorPrefix = `Property '` + ctx.STRUCTURE_IDENTIFIER().text + `':`;
                            itemStringResult += this.evalExpression(node.text, ctx, errorPrefix);
                            break;
                        
                        default:
                            itemStringResult += node.text;
                            break;
                    }
                }

                result.push(itemStringResult.trim());
            }
        }

        return result.length === 1? result[0] : result;
    }

    public visitTemplateDefinition(ctx: lp.TemplateDefinitionContext): any {
        const templateNameContext: lp.TemplateNameLineContext = ctx.templateNameLine();
        if (templateNameContext.templateName().text === this.currentTarget().templateName) {
            return this.visit(ctx.templateBody());
        }

        return undefined;
    }

    public visitNormalBody(ctx: lp.NormalBodyContext): any {
        return this.visit(ctx.normalTemplateBody());
    }

    public visitNormalTemplateBody(ctx: lp.NormalTemplateBodyContext): any {
        const normalTemplateStrs: lp.TemplateStringContext[] = ctx.templateString();
        // tslint:disable-next-line: insecure-random
        const randomNumber: number = Math.floor(Math.random() * normalTemplateStrs.length);

        return this.visit(normalTemplateStrs[randomNumber].normalTemplateString());
    }

    public visitIfElseBody(ctx: lp.IfElseBodyContext): any {
        const ifRules: lp.IfConditionRuleContext[] = ctx.ifElseTemplateBody().ifConditionRule();
        for (const ifRule of ifRules) {
            if (this.evalCondition(ifRule.ifCondition()) && ifRule.normalTemplateBody() !== undefined) {
                return this.visit(ifRule.normalTemplateBody());
            }
        }

        return undefined;
    }

    public visitNormalTemplateString(ctx: lp.NormalTemplateStringContext): string {
        const prefixErrorMsg = LGExtensions.getPrefixErrorMessage(ctx);
        const result: any[] = [];
        for (const node of ctx.children) {
            const innerNode: TerminalNode = node as TerminalNode;
            switch (innerNode.symbol.type) {
                case lp.LGFileParser.MULTILINE_SUFFIX:
                case lp.LGFileParser.MULTILINE_PREFIX:
                case lp.LGFileParser.DASH:
                    break;
                case lp.LGFileParser.ESCAPE_CHARACTER:
                    result.push(this.evalEscape(innerNode.text));
                    break;
                case lp.LGFileParser.EXPRESSION:
                    result.push(this.evalExpression(innerNode.text, ctx, prefixErrorMsg));
                    break;
                default: {
                    result.push(innerNode.text);
                    break;
                }
            }
        }

        if (result.length === 1 && !(typeof result[0] === 'string')) {
            return result[0];
        }

        return result.map((u: any): string => {
            if (typeof u === 'string') {
                return u;
            } else {
                return JSON.stringify(u);
            }
        }).join('');
    }

    public constructScope(inputTemplateName: string, args: any[]): any {
        var templateName = this.parseTemplateName(inputTemplateName).pureTemplateName;

        if (!this.templateMap[templateName]) {
            throw new Error(LGErrors.templateNotExist(templateName));
        }

        const parameters: string[] = this.templateMap[templateName].parameters;
        const currentScope: any = this.currentTarget().scope;

        if (args.length === 0) {
            // no args to construct, inherit from current scope
            return currentScope;
        }

        const newScope: any = {};
        parameters.map((e: string, i: number): void => newScope[e] = args[i]);
        const memory = currentScope as CustomizedMemory;
        if (!memory) {
            throw new Error(LGErrors.invalidMemory);
        }

        return new CustomizedMemory(memory.globalMemory, SimpleObjectMemory.wrap(newScope));
    }

    public visitSwitchCaseBody(ctx: lp.SwitchCaseBodyContext): string {
        const switchcaseNodes: lp.SwitchCaseRuleContext[] = ctx.switchCaseTemplateBody().switchCaseRule();
        const length: number = switchcaseNodes.length;
        const switchNode: lp.SwitchCaseRuleContext = switchcaseNodes[0];
        const switchExprs: TerminalNode[] = switchNode.switchCaseStat().EXPRESSION();
        const switchErrorPrefix = `Switch '` + switchExprs[0].text + `': `;
        const switchExprResult = this.evalExpression(switchExprs[0].text, switchcaseNodes[0].switchCaseStat(), switchErrorPrefix).ToString();
        let idx = 0;
        for (const caseNode of switchcaseNodes) {
            if (idx === 0) {
                idx++;
                continue; //skip the first node which is a switch statement
            }
            if (idx === length - 1 && caseNode.switchCaseStat().DEFAULT() !== undefined) {
                const defaultBody: lp.NormalTemplateBodyContext = caseNode.normalTemplateBody();
                if (defaultBody !== undefined) {
                    return this.visit(defaultBody);
                } else {
                    return undefined;
                }
            }

            const caseExprs: TerminalNode[] = caseNode.switchCaseStat().EXPRESSION();
            const caseErrorPrefix = `Case '` + caseExprs[0].text + `': `;
            const caseExprResult = this.evalExpression(caseExprs[0].text, caseNode.switchCaseStat(), caseErrorPrefix).ToString();
            if (switchExprResult === caseExprResult) {
                return this.visit(caseNode.normalTemplateBody());
            }

            idx++;
        }

        return undefined;
    }

    public wrappedEvalTextContainsExpression(exp: string, regex: RegExp): string {
        return (exp.split('').reverse().join('').replace(regex, (sub: string): any => this.evalExpression(sub.split('').reverse().join('')).toString().split('').reverse().join(''))).split('').reverse().join('');
    }

    protected defaultResult(): string {
        return '';
    }

    private currentTarget(): EvaluationTarget {
        // just don't want to write evaluationTargetStack.Peek() everywhere
        return this.evaluationTargetStack[this.evaluationTargetStack.length - 1];
    }

    private evalCondition(condition: lp.IfConditionContext): boolean {
        const expression: TerminalNode = condition.EXPRESSION()[0]; // Here ts is diff with C#, C# use condition.EXPRESSION(0) == null
        // to judge ELSE condition. But in ts lib this action would throw
        // Error

        if (!expression) {
            return true;                                            // no expression means it's else
        }

        if (this.evalExpressionInCondition(expression[0].text, condition, `Condition '` + expression.text + `':`)) {
            return true;
        }

        return false;
    }

    private evalExpressionInCondition(exp: string, context: ParserRuleContext = undefined, errorPrefix: string = ''): boolean {
        exp = LGExtensions.trimExpression(exp);
        let result: any;
        let error: string;
        ({value: result, error: error} = this.evalByExpressionEngine(exp, this.currentTarget().scope));

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
                childErrorMsg += LGErrors.nullExpression(exp);
            }

            if (context != null)
            {
                errorMsg += LGErrors.errorExpression(context.text, this.currentTarget().templateName, errorPrefix);
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

    private evalExpression(exp: string, context: ParserRuleContext = undefined, errorPrefix: string = ""): any
    {
        exp = LGExtensions.trimExpression(exp);
        let result: any;
        let error: string;
        ({value: result, error: error} = this.evalByExpressionEngine(exp, this.currentTarget().scope));

        if (error || (!result && this.strictMode))
        {
            let errorMsg = '';

            let childErrorMsg = '';
            if (error)
            {
                childErrorMsg += error;
            }
            else if (!result)
            {
                childErrorMsg += LGErrors.nullExpression(exp);
            }

            if (context)
            {
                errorMsg += LGErrors.errorExpression(context.text, this.currentTarget().templateName, errorPrefix);
            }

            if (this.evaluationTargetStack.length > 0)
            {
                this.evaluationTargetStack.pop();
            }

            throw new Error(childErrorMsg + errorMsg);
        }
        else if (!result && !this.strictMode)
        {
            result = `null`;
        }

        return result;
    }

    public static isPureExpression(ctx: lp.KeyValueStructureValueContext):  {hasExpr: boolean; expression: string | undefined} {
        let expression = ctx.text;
        let hasExpr = false;
        for (const node of ctx.children) {
            switch ((node as TerminalNode).symbol.type) {
                case (lp.LGFileParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY):
                    return {hasExpr, expression};
                case (lp.LGFileParser.EXPRESSION_IN_STRUCTURE_BODY):
                    if (hasExpr) {
                        return {hasExpr: false, expression: expression};
                    }

                    hasExpr = true;
                    expression = node.text;
                    break;
                default:
                    if (node !== undefined && node.text !== '' && node.text !== ' ') {
                        return {hasExpr: false, expression: expression};
                    }

                    break;
            }
        }

        return {hasExpr: hasExpr, expression: expression};
    }

    private evalByExpressionEngine(exp: string, scope: any): { value: any; error: string } {
        const parse: Expression = this.expressionEngine.parse(exp);

        return parse.tryEvaluate(scope);
    }

    // Genearte a new lookup function based on one lookup function
    private readonly customizedEvaluatorLookup = (baseLookup: EvaluatorLookup): any => (name: string): any => {
        const prebuiltPrefix = 'prebuilt.';

        if (name.startsWith(prebuiltPrefix)) {
            return baseLookup(name.substring(prebuiltPrefix.length));
        }

        var templateName = this.parseTemplateName(name).pureTemplateName;
        if (templateName in this.templateMap) {
            // tslint:disable-next-line: max-line-length
            return new ExpressionEvaluator(templateName, ExpressionFunctions.apply(this.templateEvaluator(name)), ReturnType.Object, this.validTemplateReference);
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

        return baseLookup(name);
    }

    private evalEscape(exp: string): string {
        const validCharactersDict: any = {
            '\\r': '\r',
            '\\n': '\n',
            '\\t': '\t'
        };

        return exp.replace(/\\[^\r\n]?/g, (sub: string): string => { 
            if (sub in validCharactersDict) {
                return validCharactersDict[sub];
            } else {
                return sub.substr(1);
            }
        });
    }

    private readonly isTemplate = (): any => (args: readonly any[]): boolean => {
        const templateName = args[0].toString();
        return templateName in this.templateMap;
    }

    private readonly fromFile = (): any => (args: readonly any[]): any => {
        const filePath: string = LGExtensions.normalizePath(args[0].toString());
        const resourcePath: string = this.getResourcePath(filePath);
        const stringContent = fs.readFileSync(resourcePath, 'utf-8');

        const result = this.wrappedEvalTextContainsExpression(stringContent, Evaluator.expressionRecognizeReverseRegex);
        return this.evalEscape(result);
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
            const template: LGTemplate = this.templateMap[this.currentTarget().templateName];
            const sourcePath: string = LGExtensions.normalizePath(template.source);
            let baseFolder: string = __dirname;
            if (path.isAbsolute(sourcePath)){
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

        return this.evaluateTemplate(templateName, newScope);
    }

    private readonly validateTemplateFunction = (expression: Expression): void => {
        
        ExpressionFunctions.validateAtLeastOne(expression);

        const children0: Expression = expression.children[0];

        // Validate return type
        if (children0.returnType !== ReturnType.Object && children0.returnType !== ReturnType.String) {
            throw new Error(LGErrors.errorTemplateNameformat(children0.toString()));
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
            throw new Error(LGErrors.templateNotExist(templateName));
        }

        var expectedArgsCount = this.templateMap[templateName].parameters.length;
        var actualArgsCount = children.length;

        if (actualArgsCount !== 0 && expectedArgsCount !== actualArgsCount)
        {
            throw new Error(LGErrors.argumentMismatch(templateName, expectedArgsCount, actualArgsCount));
        }
    }

    private readonly templateEvaluator = (templateName: string): any => (args: readonly any[]): any => {
        const newScope: any = this.constructScope(templateName, Array.from(args));

        return this.evaluateTemplate(templateName, newScope);
    }

    private readonly validTemplateReference = (expression: Expression): void => {
        const templateName: string = expression.type;

        if (!this.templateMap[templateName]) {
            throw new Error(`no such template '${ templateName }' to call in ${ expression }`);
        }

        const expectedArgsCount: number = this.templateMap[templateName].parameters.length;
        const actualArgsCount: number = expression.children.length;

        if (expectedArgsCount !== actualArgsCount) {
            throw new Error(`arguments mismatch for template ${ templateName }, expect ${ expectedArgsCount } actual ${ actualArgsCount }`);
        }
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
