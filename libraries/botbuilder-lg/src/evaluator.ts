/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line: no-submodule-imports
import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
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
    private readonly evalutationTargetStack: EvaluationTarget[] = [];

    // to support broswer, use look-ahead replace look-behind
    // original:/(?<!\\)$\{((\'[^\'\r\n]*\')|(\"[^\"\r\n]*\")|(\`(\\\`|[^\`])*\`)|[^\r\n\{\}\'\"\`])*?\}/g;
    public static readonly expressionRecognizeReverseRegex: RegExp = new RegExp(/\}((\'[^\'\r\n]*\')|(\"[^\"\r\n]*\")|(\`(\\\`|[^\`])*\`)|([^\r\n\{\}\'\"\`]))*?\{\$(?!\\)/g);

    public static readonly LGType = 'lgType';
    public static readonly activityAttachmentFunctionName = 'ActivityAttachment';
    public static readonly fromFileFunctionName = 'fromFile';
    public static readonly templateFunctionName = 'template';
    public static readonly isTemplateFunctionName = 'isTemplate';

    public constructor(templates: LGTemplate[], expressionEngine: ExpressionEngine) {
        super();
        this.templates = templates;
        this.templateMap = keyBy(templates, (t: LGTemplate): string => t.name);

        // generate a new customzied expression engine by injecting the template as functions
        this.expressionEngine = new ExpressionEngine(this.customizedEvaluatorLookup(expressionEngine.EvaluatorLookup));
    }

    public static wrappedRegExSplit(inputString: string, regex: RegExp): string[] {
        return inputString.split('').reverse().join('').split(regex).map((e: string): string => e.split('').reverse().join('')).reverse();
    }

    /**
     * Evaluate a template with given name and scope.
     * @param templateName template name.
     * @param scope scope.
     * @returns Evaluate result.
     */
    public evaluateTemplate(templateName: string, scope: any): any {
        if (!(templateName in this.templateMap)) {
            throw new Error(`No such template: ${ templateName }`);
        }

        if (this.evalutationTargetStack.find((u: EvaluationTarget): boolean => u.templateName === templateName) !== undefined) {
            throw new Error(`Loop detected: ${ this.evalutationTargetStack.reverse()
                .map((u: EvaluationTarget): string => u.templateName)
                .join(' => ') }`);
        }

        if(!(scope instanceof CustomizedMemory)) {
            scope = new CustomizedMemory(SimpleObjectMemory.wrap(scope));
        }

        const templateTarget: EvaluationTarget = new EvaluationTarget(templateName, scope);
        const currentEvulateId: string = templateTarget.getId();

        let previousEvaluateTarget: EvaluationTarget;

        if (this.evalutationTargetStack.length !== 0) {
            previousEvaluateTarget = this.evalutationTargetStack[this.evalutationTargetStack.length - 1];
            if (previousEvaluateTarget.evaluatedChildren.has(currentEvulateId)) {
                return previousEvaluateTarget.evaluatedChildren.get(currentEvulateId);
            }
        }

        // Using a stack to track the evalution trace
        this.evalutationTargetStack.push(templateTarget);
        const result: string = this.visit(this.templateMap[templateName].parseTree);

        if (previousEvaluateTarget) {
            previousEvaluateTarget.evaluatedChildren.set(currentEvulateId, result);
        }

        this.evalutationTargetStack.pop();

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
                const propertyObject: any = this.evalExpression(body.objectStructureLine().text);
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
                result.push(this.evalExpression(Evaluator.isPureExpression(item).expression));
            } else {
                let itemStringResult = '';
                for(const node of item.children) {
                    switch ((node as TerminalNode).symbol.type) {
                        case (lp.LGFileParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY): 
                            itemStringResult += this.evalEscape(node.text);
                            break;
                        
                        case (lp.LGFileParser.EXPRESSION_IN_STRUCTURE_BODY):
                            itemStringResult += this.evalExpression(node.text);
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
                    result.push(this.evalExpression(innerNode.text));
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

    public constructScope(templateName: string, args: any[]): any {
        if (!this.templateMap[templateName]) {
            throw new Error(`No such template ${ templateName }`);
        }

        const parameters: string[] = this.templateMap[templateName].parameters;
        const currentScope: any = this.currentTarget().scope;

        if (args.length === 0) {
            // no args to construct, inherit from current scope
            return currentScope;
        }

        if (parameters && (args === undefined || parameters.length !== args.length)) {
            throw new Error(`The length of required parameters does not match the length of provided parameters.`);
        }

        const newScope: any = {};
        parameters.map((e: string, i: number): void => newScope[e] = args[i]);

        if (currentScope instanceof CustomizedMemory) {
            //inherit current memory's global scope
            const memory =  new CustomizedMemory();
            memory.globalMemory = currentScope.globalMemory;
            memory.localMemory = new SimpleObjectMemory(newScope);

            return memory;
        } else {
            throw new Error(`Scope is a LG customized memory`);
        }
    }

    public visitSwitchCaseBody(ctx: lp.SwitchCaseBodyContext): string {
        const switchcaseNodes: lp.SwitchCaseRuleContext[] = ctx.switchCaseTemplateBody().switchCaseRule();
        const length: number = switchcaseNodes.length;
        const switchNode: lp.SwitchCaseRuleContext = switchcaseNodes[0];
        const switchExprs: TerminalNode[] = switchNode.switchCaseStat().EXPRESSION();
        const switchExprResult: string = this.evalExpression(switchExprs[0].text).toString();
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
            const caseExprResult: string = this.evalExpression(caseExprs[0].text).toString();
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
        return this.evalutationTargetStack[this.evalutationTargetStack.length - 1];
    }

    private evalCondition(condition: lp.IfConditionContext): boolean {
        const expressions: TerminalNode[] = condition.EXPRESSION(); // Here ts is diff with C#, C# use condition.EXPRESSION(0) == null
        // to judge ELSE condition. But in ts lib this action would throw
        // Error

        if (expressions === undefined || expressions.length === 0) {
            return true;                                            // no expression means it's else
        }

        if (this.evalExpressionInCondition(expressions[0].text)) {
            return true;
        }

        return false;
    }

    private evalExpressionInCondition(exp: string): boolean {
        try {
            exp = LGExtensions.trimExpression(exp);

            const { value: result, error }: { value: any; error: string } = this.evalByExpressionEngine(exp, this.currentTarget().scope);
            if (error !== undefined
                || result === undefined
                || typeof result === 'boolean' && !Boolean(result)
                || Number.isInteger(result) && Number(result) === 0) {
                return false;
            }

            return true;
        } catch (error) {
            return false;
        }
    }

    private evalExpression(exp: string): any {
        exp = LGExtensions.trimExpression(exp);

        const { value: result, error }: { value: any; error: string } = this.evalByExpressionEngine(exp, this.currentTarget().scope);
        if (error !== undefined) {
            throw new Error(`Error occurs when evaluating expression ${ exp }: ${ error }`);
        }
        if (result === undefined) {
            throw new Error(`Error occurs when evaluating expression '${ exp }': ${ exp } is evaluated to null`);
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

        if (this.templateMap[name]) {
            // tslint:disable-next-line: max-line-length
            return new ExpressionEvaluator(name, ExpressionFunctions.apply(this.templateEvaluator(name)), ReturnType.Object, this.validTemplateReference);
        }

        if (name === Evaluator.templateFunctionName) {
            return new ExpressionEvaluator(Evaluator.templateFunctionName, ExpressionFunctions.apply(this.templateFunction()), ReturnType.Object, this.validateTemplateFunction);
        }

        if (name === Evaluator.fromFileFunctionName) {
            return new ExpressionEvaluator(Evaluator.fromFileFunctionName, ExpressionFunctions.apply(this.fromFile()), ReturnType.Object, this.validateFromFile);
        }

        if (name === Evaluator.activityAttachmentFunctionName) {
            return new ExpressionEvaluator(Evaluator.activityAttachmentFunctionName, ExpressionFunctions.apply(this.activityAttachment()), ReturnType.Object, this.validateActivityAttachment);
        }

        if (name === Evaluator.isTemplateFunctionName) {
            return new ExpressionEvaluator(Evaluator.isTemplateFunctionName, ExpressionFunctions.apply(this.isTemplate()), ReturnType.Boolean, this.validateIsTemplate);
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

    private readonly validateIsTemplate = (expression: Expression): void => {
        if (expression.children.length !== 1) {
            throw new Error(`isTemplate should have one parameter`);
        }

        const children0: Expression = expression.children[0];
        if (children0.returnType !== ReturnType.Object && children0.returnType !== ReturnType.String) {
            throw new Error(`${ children0 } can't be used as a template name, must be a string value`);
        }
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

    private readonly validateFromFile = (expression: Expression): void => {
        if (expression.children.length !== 1) {
            throw new Error(`fromFile should have one parameter`);
        }

        const children0: Expression = expression.children[0];
        if (children0.returnType !== ReturnType.Object && children0.returnType !== ReturnType.String) {
            throw new Error(`${ children0 } can't be used as a file path, must be a string value`);
        }
    }

    private readonly activityAttachment = (): any => (args: readonly any[]): any => {
        return {
            [Evaluator.LGType]: 'attachment',
            contenttype: args[1].toString(),
            content: args[0]
        };
    }

    private readonly validateActivityAttachment = (expression: Expression): void => {
        if (expression.children.length !== 2) {
            throw new Error(`ActivityAttachment should have two parameters`);
        }

        const children0: Expression = expression.children[0];
        if (children0.returnType !== ReturnType.Object) {
            throw new Error(`${ children0 } can't be used as a json file`);
        }

        const children1: Expression = expression.children[1];
        if (children1.returnType !== ReturnType.Object && children1.returnType !== ReturnType.String) {
            throw new Error(`${ children0 } can't be used as an attachment format, must be a string value`);
        }
    }

    private readonly templateFunction = (): any => (args: readonly any[]): any => {
        const templateName: string = args[0];
        const newScope: any = this.constructScope(templateName, args.slice(1));

        return this.evaluateTemplate(templateName, newScope);
    }

    private readonly validateTemplateFunction = (expression: Expression): void => {
        if (expression.children.length === 0) {
            throw new Error(`No template name is provided when calling lgTemplate, expected: lgTemplate(templateName, ...args)`);
        }

        const children0: Expression = expression.children[0];

        // Validate return type
        if (children0.returnType !== ReturnType.Object && children0.returnType !== ReturnType.String) {
            throw new Error(`${ children0 } can't be used as a template name, must be a string value`);
        }

        // Validate more if the name is string constant
        if (children0.type === ExpressionType.Constant) {
            const templateName: string = (children0 as Constant).value;
            if (!this.templateMap[templateName]) {
                throw new Error(`No such template '${ templateName }' to call in ${ expression }`);
            }

            const expectedArgsCount: number = this.templateMap[templateName].parameters.length;
            const actualArgsCount: number = expression.children.length - 1;

            if (expectedArgsCount !== actualArgsCount) {
                throw new Error(`Arguments mismatch for template ${ templateName }, expect ${ expectedArgsCount } actual ${ actualArgsCount }`);
            }
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
}
