
/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line: no-submodule-imports
import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import { BuiltInFunctions, EvaluatorLookup, Expression, ExpressionEvaluator, ReturnType } from 'botbuilder-expression';
import { ExpressionEngine } from 'botbuilder-expression-parser';
import { keyBy } from 'lodash';
import { EvaluationTarget } from './evaluationTarget';
import * as lp from './generated/LGFileParser';
import { LGFileParserVisitor } from './generated/LGFileParserVisitor';
import { LGTemplate } from './lgTemplate';

/**
 * Evaluation tuntime engine
 */
// tslint:disable-next-line: max-classes-per-file
export class Evaluator extends AbstractParseTreeVisitor<any> implements LGFileParserVisitor<any> {
    public readonly Templates: LGTemplate[];
    public readonly ExpressionEngine: ExpressionEngine;
    public readonly TemplateMap: { [name: string]: LGTemplate };
    private readonly evalutationTargetStack: EvaluationTarget[] = [];
    private readonly expressionRecognizeRegex: RegExp = new RegExp(/@?(?<!\\)\{.+?(?<!\\)\}/g);
    private readonly escapeSeperatorRegex : RegExp = new RegExp(/(?<!\\)\|/g);

    constructor(templates: LGTemplate[], expressionEngine: ExpressionEngine) {
        super();
        this.Templates = templates;
        this.TemplateMap = keyBy(templates, (t: LGTemplate) => t.Name);

        // generate a new customzied expression engine by injecting the template as functions
        this.ExpressionEngine = new ExpressionEngine(this.customizedEvaluatorLookup(expressionEngine.EvaluatorLookup));
    }

    public EvaluateTemplate(templateName: string, scope: any): any {
        if (!(templateName in this.TemplateMap)) {
            throw new Error(`No such template: ${templateName}`);
        }

        if (this.evalutationTargetStack.find((u: EvaluationTarget) => u.TemplateName === templateName) !== undefined) {
            throw new Error(`Loop deteced: ${this.evalutationTargetStack.reverse()
                .map((u: EvaluationTarget) => u.TemplateName)
                .join(' => ')}`);
        }

        const templateTarget: EvaluationTarget = new EvaluationTarget(templateName, scope);
        const currentEvulateId: string = templateTarget.GetId();

        let previousEvaluateTarget: EvaluationTarget;

        if (this.evalutationTargetStack.length !== 0) {
            previousEvaluateTarget = this.evalutationTargetStack[this.evalutationTargetStack.length - 1];
            if (previousEvaluateTarget.EvaluatedChildren.has(currentEvulateId)) {
                return previousEvaluateTarget.EvaluatedChildren.get(currentEvulateId);
            }
        }

        // Using a stack to track the evalution trace
        this.evalutationTargetStack.push(templateTarget);
        const result: string = this.visit(this.TemplateMap[templateName].ParseTree);

        if (previousEvaluateTarget !== undefined) {
            previousEvaluateTarget.EvaluatedChildren.set(currentEvulateId, result);
        }

        this.evalutationTargetStack.pop();

        return result;
    }

    public visitStructuredTemplateBody(ctx: lp.StructuredTemplateBodyContext): any {
        const result: any = {};
        const typeName: string = ctx.structuredBodyNameLine().STRUCTURED_CONTENT().text;
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

                const valueArray: string[] = originValue.split(this.escapeSeperatorRegex);
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
        if (templateNameContext.templateName().text === this.currentTarget().TemplateName) {
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
            const innerNode: TerminalNode = <TerminalNode>node;
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

        return result.map((u: any) => {
            if (typeof u === 'string') {
                return u;
            } else {
                return JSON.stringify(u);
            }
        }).join('');
    }

    public ConstructScope(templateName: string, args: any[]): any {
        const parameters: string[] = this.TemplateMap[templateName].Parameters;

        if (args.length === 0) {
            // no args to construct, inherit from current scope
            return this.currentTarget().Scope;
        }

        if (parameters !== undefined && (args === undefined || parameters.length !== args.length)) {
            throw new Error(`The length of required parameters does not match the length of provided parameters.`);
        }

        const newScope: any = {};
        parameters.map((e: string, i: number) => newScope[e] = args[i]);

        return newScope;
    }

    public visitSwitchCaseBody(ctx: lp.SwitchCaseBodyContext): string {
        const switchcaseNodes: lp.SwitchCaseRuleContext[] = ctx.switchCaseTemplateBody().switchCaseRule();
        const length: number = switchcaseNodes.length;
        const switchNode: lp.SwitchCaseRuleContext = switchcaseNodes[0];
        const switchExprs: TerminalNode[] = switchNode.switchCaseStat().EXPRESSION();
        const switchExprResult: string = this.evalExpression(switchExprs[0].text).toString();
        let idx: number = 0;
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

            const { value: result, error }: { value: any; error: string } = this.evalByExpressionEngine(exp, this.currentTarget().Scope);
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

        const { value: result, error }: { value: any; error: string } = this.evalByExpressionEngine(exp, this.currentTarget().Scope);
        if (error !== undefined) {
            throw new Error(`Error occurs when evaluating expression ${exp}: ${error}`);
        }
        if (result === undefined) {
            throw new Error(`Error occurs when evaluating expression '${exp}': ${exp} is evaluated to null`);
        }

        return result;
    }

    private evalTemplateRef(exp: string): any {
        exp = exp.replace(/(^\[*)/g, '')
            .replace(/(\]*$)/g, '');

        if (exp.indexOf('(') < 0) {
            if (exp in this.TemplateMap) {
                exp = exp.concat('(')
                    .concat(this.TemplateMap[exp].Parameters.join())
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

    private evalTextContainsExpression(exp: string) : string {
        return exp.replace(this.expressionRecognizeRegex, (sub: string) => this.evalExpression(sub));
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
        const expressions: RegExpMatchArray = exp.match(this.expressionRecognizeRegex);

        // If there is no match, expressions could be null
        return expressions !== null && expressions !== undefined && expressions.length === 1 && expressions[0] === exp;
    }

    private evalByExpressionEngine(exp: string, scope: any): { value: any; error: string } {
        const parse: Expression = this.ExpressionEngine.parse(exp);

        return parse.tryEvaluate(scope);
    }

    // Genearte a new lookup function based on one lookup function
    private readonly customizedEvaluatorLookup = (baseLookup: EvaluatorLookup): any => (name: string): any => {
        const prebuiltPrefix: string = 'prebuilt.';

        if (name.startsWith(prebuiltPrefix)) {
            return baseLookup(name.substring(prebuiltPrefix.length));
        }

        if (this.TemplateMap[name] !== undefined) {
            // tslint:disable-next-line: max-line-length
            return new ExpressionEvaluator(name, BuiltInFunctions.Apply(this.templateEvaluator(name)), ReturnType.Object, this.validTemplateReference);
        }

        return baseLookup(name);
    }

    private readonly templateEvaluator = (templateName: string): any => (args: ReadonlyArray<any>): any => {
        const newScope: any = this.ConstructScope(templateName, Array.from(args));

        return this.EvaluateTemplate(templateName, newScope);
    }

    private readonly validTemplateReference = (expression: Expression): void => {
        const templateName: string = expression.Type;

        if (this.TemplateMap[templateName] === undefined) {
            throw new Error(`no such template '${templateName}' to call in ${expression}`);
        }

        const expectedArgsCount: number = this.TemplateMap[templateName].Parameters.length;
        const actualArgsCount: number = expression.Children.length;

        if (expectedArgsCount !== actualArgsCount) {
            throw new Error(`arguments mismatch for template ${templateName}, expect ${expectedArgsCount} actual ${actualArgsCount}`);
        }
    }
}
