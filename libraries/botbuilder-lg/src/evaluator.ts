
/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line: no-submodule-imports
import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import { BuiltInFunctions, Constant, EvaluatorLookup, Expression, ExpressionEngine, ExpressionEvaluator, ExpressionType, ReturnType } from 'botframework-expressions';
import { keyBy } from 'lodash';
import { CustomizedMemoryScope } from './customizedMemoryScope';
import { EvaluationTarget } from './evaluationTarget';
import * as lp from './generated/LGFileParser';
import { LGFileParserVisitor } from './generated/LGFileParserVisitor';
import { LGTemplate } from './lgTemplate';

/**
 * Evaluation tuntime engine
 */
// tslint:disable-next-line: max-classes-per-file
export class Evaluator extends AbstractParseTreeVisitor<any> implements LGFileParserVisitor<any> {
    public readonly templates: LGTemplate[];
    public readonly expressionEngine: ExpressionEngine;
    public readonly templateMap: { [name: string]: LGTemplate };
    private readonly evalutationTargetStack: EvaluationTarget[] = [];
    private readonly expressionRecognizeRegex: RegExp = new RegExp(/\}(?!\\).+?\{(?!\\)@?/g);
    private readonly escapeSeperatorRegex: RegExp = new RegExp(/\|(?!\\)/g);

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

    public evaluateTemplate(templateName: string, scope: any): any {
        if (!(templateName in this.templateMap)) {
            throw new Error(`No such template: ${ templateName }`);
        }

        if (this.evalutationTargetStack.find((u: EvaluationTarget): boolean => u.templateName === templateName) !== undefined) {
            throw new Error(`Loop deteced: ${ this.evalutationTargetStack.reverse()
                .map((u: EvaluationTarget): string => u.templateName)
                .join(' => ') }`);
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

        if (previousEvaluateTarget !== undefined) {
            previousEvaluateTarget.evaluatedChildren.set(currentEvulateId, result);
        }

        this.evalutationTargetStack.pop();

        return result;
    }

    public visitStructuredTemplateBody(ctx: lp.StructuredTemplateBodyContext): any {
        const result: any = {};
        const typeName: string = ctx.structuredBodyNameLine().STRUCTURED_CONTENT().text.trim();
        result.$type = typeName;

        const bodys: TerminalNode[] = ctx.structuredBodyContentLine().STRUCTURED_CONTENT();
        for (const body  of bodys) {
            const line: string = body.text.trim();
            if (line === '') {
                continue;
            }
            const start: number = line.indexOf('=');
            if (start > 0) {
                // make it insensitive
                const property: string = line.substr(0, start).trim().toLowerCase();
                const originValue: string = line.substr(start + 1).trim();

                const valueArray: string[] = Evaluator.wrappedRegExSplit(originValue, this.escapeSeperatorRegex);
                if (valueArray.length === 1) {
                    result[property] = this.evalText(originValue);
                } else {
                    const valueList: any[] = [];
                    for (const item of valueArray) {
                        valueList.push(this.evalText(item.trim()));
                    }

                    result[property] = valueList;
                }
            } else if (this.isPureExpression(line)) {
                // [MyStruct
                // Text = foo
                // {ST2()}
                // ]

                // When the same property exists in both the calling template as well as callee,
                //the content in caller will trump any content in the callee.
                const propertyObject: any = this.evalExpression(line);

                // Full reference to another structured template is limited to the structured template with same type
                if (typeof propertyObject === 'object' && '$type' in propertyObject &&  propertyObject.$type.toString() === typeName) {
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
                case lp.LGFileParser.DASH: break;
                case lp.LGFileParser.ESCAPE_CHARACTER:
                    result.push(this.evalEscapeCharacter(innerNode.text));
                    break;
                case lp.LGFileParser.EXPRESSION: {
                    result.push(this.evalExpression(innerNode.text));
                    break;
                }
                case lp.LGFileParser.TEMPLATE_REF: {
                    result.push(this.evalTemplateRef(innerNode.text));
                    break;
                }
                case lp.LGFileParser.MULTI_LINE_TEXT: {
                    result.push(this.evalMultiLineText(innerNode.text));
                    break;
                }
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
        if (this.templateMap[templateName] === undefined) {
            throw new Error(`No such template ${ templateName }`);
        }

        const parameters: string[] = this.templateMap[templateName].parameters;
        const currentScope: any = this.currentTarget().scope;

        if (args.length === 0) {
            // no args to construct, inherit from current scope
            return currentScope;
        }

        if (parameters !== undefined && (args === undefined || parameters.length !== args.length)) {
            throw new Error(`The length of required parameters does not match the length of provided parameters.`);
        }

        const newScope: any = {};
        parameters.map((e: string, i: number): void => newScope[e] = args[i]);

        if (currentScope instanceof CustomizedMemoryScope) {
            return new CustomizedMemoryScope(newScope, currentScope.globalScope);
        } else {
            return new CustomizedMemoryScope(newScope, currentScope);
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

    private evalEscapeCharacter(exp: string): any {
        const validCharactersDict: any = {
            '\\r': '\r',
            '\\n': '\n',
            '\\t': '\t',
            '\\\\': '\\',
            '\\[': '[',
            '\\]': ']',
            '\\{': '{',
            '\\}': '}'
        };

        return validCharactersDict[exp];
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
            exp = exp.replace(/(^@*)/g, '')
                .replace(/(^{*)/g, '')
                .replace(/(}*$)/g, '');

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
        exp = exp.replace(/(^@*)/g, '')
            .replace(/(^{*)/g, '')
            .replace(/(}*$)/g, '');

        const { value: result, error }: { value: any; error: string } = this.evalByExpressionEngine(exp, this.currentTarget().scope);
        if (error !== undefined) {
            throw new Error(`Error occurs when evaluating expression ${ exp }: ${ error }`);
        }
        if (result === undefined) {
            throw new Error(`Error occurs when evaluating expression '${ exp }': ${ exp } is evaluated to null`);
        }

        return result;
    }

    private evalTemplateRef(exp: string): any {
        exp = exp.replace(/(^\[*)/g, '')
            .replace(/(\]*$)/g, '');

        if (exp.indexOf('(') < 0) {
            if (exp in this.templateMap) {
                exp = exp.concat('(')
                    .concat(this.templateMap[exp].parameters.join())
                    .concat(')');
            } else {
                exp = exp.concat('()');
            }
        }

        return this.evalExpression(exp);
    }

    private evalMultiLineText(exp: string): string {

        exp = exp.substr(3, exp.length - 6); //remove ``` ```

        return this.evalTextContainsExpression(exp);
    }

    private evalTextContainsExpression(exp: string): string {
        return this.wrappedEvalTextContainsExpression(exp, this.expressionRecognizeRegex);
    }

    private evalText(exp: string): any {
        if (exp === undefined || exp.length === 0) {
            return exp;
        }

        if (this.isPureExpression(exp)) {
            return this.evalExpression(exp);
        } else {

            // unescape \|
            return this.evalTextContainsExpression(exp).replace(/\\\|/g, '|');
        }
    }

    private isPureExpression(exp: string): boolean {
        if (exp === undefined || exp.length === 0) {
            return false;
        }

        exp = exp.trim();
        const reversedExps: RegExpMatchArray = exp.split('').reverse().join('').match(this.expressionRecognizeRegex);
        // If there is no match, expressions could be null
        if (reversedExps === null || reversedExps === undefined || reversedExps.length !== 1) {
            return false;
        } else {
            return reversedExps[0].split('').reverse().join('') === exp;
        }

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

        if (this.templateMap[name] !== undefined) {
            // tslint:disable-next-line: max-line-length
            return new ExpressionEvaluator(name, BuiltInFunctions.apply(this.templateEvaluator(name)), ReturnType.Object, this.validTemplateReference);
        }

        const lgTemplate = 'lgTemplate';

        if (name === lgTemplate) {
            return new ExpressionEvaluator(lgTemplate, BuiltInFunctions.apply(this.lgTemplate()), ReturnType.Object, this.validateLgTemplate);
        }

        return baseLookup(name);
    }

    private readonly lgTemplate = (): any => (args: readonly any[]): any => {
        const templateName: string = args[0];
        const newScope: any = this.constructScope(templateName, args.slice(1));

        return this.evaluateTemplate(templateName, newScope);
    }

    private readonly validateLgTemplate = (expression: Expression): void => {
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
            if (this.templateMap[templateName] === undefined) {
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

        if (this.templateMap[templateName] === undefined) {
            throw new Error(`no such template '${ templateName }' to call in ${ expression }`);
        }

        const expectedArgsCount: number = this.templateMap[templateName].parameters.length;
        const actualArgsCount: number = expression.children.length;

        if (expectedArgsCount !== actualArgsCount) {
            throw new Error(`arguments mismatch for template ${ templateName }, expect ${ expectedArgsCount } actual ${ actualArgsCount }`);
        }
    }
}
