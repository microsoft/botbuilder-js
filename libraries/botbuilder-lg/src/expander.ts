
/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line: no-submodule-imports
import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import { BuiltInFunctions, Constant, EvaluatorLookup, Expression, ExpressionEngine, ExpressionEvaluator, ReturnType } from 'botframework-expressions';
import { keyBy } from 'lodash';
import { v4 as uuid } from 'uuid';
import { EvaluationTarget } from './evaluationTarget';
import { Evaluator } from './evaluator';
import * as lp from './generated/LGFileParser';
import { LGFileParserVisitor } from './generated/LGFileParserVisitor';
import { LGTemplate } from './lgTemplate';

// tslint:disable-next-line: max-classes-per-file
export class Expander extends AbstractParseTreeVisitor<string[]> implements LGFileParserVisitor<string[]> {
    public readonly Templates: LGTemplate[];
    public readonly TemplateMap: {[name: string]: LGTemplate};
    private readonly evalutationTargetStack: EvaluationTarget[] = [];
    private readonly expanderExpressionEngine: ExpressionEngine;
    private readonly evaluatorExpressionEngine: ExpressionEngine;
    private readonly expressionRecognizeRegex: RegExp = new RegExp(/\}(?!\\).+?\{(?!\\)@?/g);
    private readonly escapeSeperatorRegex : RegExp = new RegExp(/\|(?!\\)/g);

    constructor(templates: LGTemplate[], expressionEngine: ExpressionEngine) {
        super();
        this.Templates = templates;
        this.TemplateMap = keyBy(templates, (t: LGTemplate) => t.Name);

        // generate a new customzied expression engine by injecting the template as functions
        this.expanderExpressionEngine = new ExpressionEngine(this.CustomizedEvaluatorLookup(expressionEngine.EvaluatorLookup, true));
        this.evaluatorExpressionEngine = new ExpressionEngine(this.CustomizedEvaluatorLookup(expressionEngine.EvaluatorLookup, false));
    }

    public ExpandTemplate(templateName: string, scope: any): string[] {
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
        const result: string[] = this.visit(this.TemplateMap[templateName].ParseTree);

        if (previousEvaluateTarget !== undefined) {
            previousEvaluateTarget.EvaluatedChildren.set(currentEvulateId, result);
        }

        this.evalutationTargetStack.pop();

        return result;
    }

    public visitTemplateDefinition(ctx: lp.TemplateDefinitionContext): string[] {
        const templateNameContext: lp.TemplateNameLineContext = ctx.templateNameLine();
        if (templateNameContext.templateName().text === this.currentTarget().TemplateName) {
            return this.visit(ctx.templateBody());
        }

        return undefined;
    }

    public visitNormalBody(ctx: lp.NormalBodyContext): string[] {
        return this.visit(ctx.normalTemplateBody());
    }

    public visitNormalTemplateBody(ctx: lp.NormalTemplateBodyContext) : string[] {
        const normalTemplateStrs: lp.TemplateStringContext[] = ctx.templateString();
        let result: string[] = [];
        for (const normalTemplateStr of normalTemplateStrs) {
            result = result.concat(this.visit(normalTemplateStr.normalTemplateString()));
        }

        return result;
    }

    public visitIfElseBody(ctx: lp.IfElseBodyContext) : string[] {
        const ifRules: lp.IfConditionRuleContext[] = ctx.ifElseTemplateBody().ifConditionRule();
        for (const ifRule of ifRules) {
            if (this.EvalCondition(ifRule.ifCondition())) {
                return this.visit(ifRule.normalTemplateBody());
            }
        }

        return undefined;
    }

    public visitStructuredBody(ctx: lp.StructuredBodyContext): string[] {
        const stb: lp.StructuredTemplateBodyContext = ctx.structuredTemplateBody();
        const result: any = {};
        const typeName: string = stb.structuredBodyNameLine().STRUCTURED_CONTENT().text;
        result.$type = typeName;

        const idToStringMap: Map<string, string> = new Map<string, string>();
        const bodys: TerminalNode[] = stb.structuredBodyContentLine().STRUCTURED_CONTENT();
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
                    const id: string = uuid();
                    result[property] = id;
                    idToStringMap.set(id, originValue);
                    //result[property] = this.evalText(originValue);
                } else {
                    const valueList: any[] = [];
                    for (const item of valueArray) {
                        const id: string = uuid();
                        valueList.push(id);
                        idToStringMap.set(id, item.trim());
                        //valueList.push(this.evalText(item.trim()));
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
                const id: string = uuid();
                const propertyObject: any = id;
                idToStringMap.set(id, line);
                //const propertyObject: any = this.EvalExpression(line);

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

        const exp: string = JSON.stringify(result);

        const templateRefValues: Map<string, string[]> = new Map<string, string[]>();
        for (const idToString of idToStringMap) {
            if ((idToString[1].startsWith('@') || idToString[1].startsWith('{')) && idToString[1].endsWith('}')) {
                templateRefValues.set(idToString[0], this.EvalExpression(idToString[1]));
            } else {
                templateRefValues.set(idToString[0], this.evalText(idToString[1]));
            }
        }

        let finalResult: string[] = [exp];
        for (const templateRefValue of templateRefValues) {
            const tempRes: string[] = [];
            for (const res of finalResult) {
                for (const refValue of templateRefValue[1]) {
                    tempRes.push(res.replace(templateRefValue[0], refValue));
                }
            }

            finalResult = tempRes;
        }

        return finalResult;
    }

    public visitSwitchCaseBody(ctx: lp.SwitchCaseBodyContext) : string[] {
        const switchcaseNodes: lp.SwitchCaseRuleContext[] = ctx.switchCaseTemplateBody().switchCaseRule();
        const length: number = switchcaseNodes.length;
        const switchNode: lp.SwitchCaseRuleContext = switchcaseNodes[0];
        const switchExprs: TerminalNode[] = switchNode.switchCaseStat().EXPRESSION();
        const switchExprResult: string[] = this.EvalExpression(switchExprs[0].text);
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
            const caseExprResult: string[] = this.EvalExpression(caseExprs[0].text);
            //condition: check whether two string array have same elements
            if (switchExprResult.sort().toString() === caseExprResult.sort().toString()) {
                return this.visit(caseNode.normalTemplateBody());
            }

            idx++;
        }

        return undefined;
    }

    public visitNormalTemplateString(ctx: lp.NormalTemplateStringContext): string[] {
        let result: string[] = [''];
        for (const node of ctx.children) {
            const innerNode: TerminalNode =  <TerminalNode>node;
            switch (innerNode.symbol.type) {
                case lp.LGFileParser.DASH: break;
                case lp.LGFileParser.ESCAPE_CHARACTER:
                    result = this.StringArrayConcat(result, [this.EvalEscapeCharacter(innerNode.text)]);
                    break;
                case lp.LGFileParser.EXPRESSION: {
                    result = this.StringArrayConcat(result, this.EvalExpression(innerNode.text));
                    break;
                }
                case lp.LGFileParser.TEMPLATE_REF: {
                    result = this.StringArrayConcat(result, this.EvalTemplateRef(innerNode.text));
                    break;
                }
                case lp.LGFileParser.MULTI_LINE_TEXT: {
                    result = this.StringArrayConcat(result, this.EvalMultiLineText(innerNode.text));
                    break;
                }
                default: {
                    result = this.StringArrayConcat(result, [innerNode.text]);
                    break;
                }
            }
        }

        return result;
    }

    public ConstructScope(templateName: string, args: any[]) : any {
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

    protected defaultResult(): string[] {
        return [];
    }

    private currentTarget(): EvaluationTarget {
        return this.evalutationTargetStack[this.evalutationTargetStack.length - 1];
    }

    private EvalEscapeCharacter(exp: string): string {
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

    private EvalCondition(condition: lp.IfConditionContext): boolean {
        const expressions: TerminalNode[] = condition.EXPRESSION();
        if (expressions === undefined || expressions.length === 0) {
            return true;    // no expression means it's else
        }

        if (this.EvalExpressionInCondition(expressions[0].text)) {
            return true;
        }

        return false;
    }

    private EvalExpressionInCondition(exp: string): boolean {
        try {
            exp = exp.replace(/(^@*)/g, '')
                .replace(/(^{*)/g, '')
                .replace(/(}*$)/g, '');

            const { value: result, error }: { value: any; error: string } = this.EvalByExpressionEngine(exp, this.currentTarget().Scope);
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

    private EvalExpression(exp: string): string[] {
        exp = exp.replace(/(^@*)/g, '')
            .replace(/(^{*)/g, '')
            .replace(/(}*$)/g, '');

        const { value: result, error }: { value: any; error: string } = this.EvalByExpressionEngine(exp, this.currentTarget().Scope);
        if (error !== undefined) {
            throw new Error(`Error occurs when evaluating expression ${exp}: ${error}`);
        }
        if (result === undefined) {
            throw new Error(`Error occurs when evaluating expression '${exp}': ${exp} is evaluated to null`);
        }

        if (result instanceof Array) {
            return result;
        } else {
            return [result.toString()];
        }
    }

    private EvalTemplateRef(exp: string) : string[] {
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

        return this.EvalExpression(exp);
    }

    private EvalMultiLineText(exp: string): string[] {

        exp = exp.substr(3, exp.length - 6);

        const templateRefValues: Map<string, string[]> = new Map<string, string[]>();
        const matches: string[] = exp.match(/@\{[^{}]+\}/g);
        if (matches !== null && matches !== undefined) {
            for (const match of matches) {
                templateRefValues.set(match, this.EvalExpression(match));
            }
        }

        let result: string[] = [exp];
        for (const templateRefValue of templateRefValues) {
            const tempRes: string[] = [];
            for (const res of result) {
                for (const refValue of templateRefValue[1]) {
                    tempRes.push(res.replace(/@\{[^{}]+\}/, refValue));
                }
            }
            result = tempRes;
        }

        return result;
    }

    private EvalByExpressionEngine(exp: string, scope: any) : any {
        const expanderExpression: Expression = this.expanderExpressionEngine.parse(exp);
        const evaluatorExpression: Expression = this.evaluatorExpressionEngine.parse(exp);
        const parse: Expression = this.ReconstructExpression(expanderExpression, evaluatorExpression, false);

        return parse.tryEvaluate(scope);
    }

    private StringArrayConcat(array1: string[], array2: string[]): string[] {
        const result: string[] = [];
        for (const item1 of array1) {
            for (const item2 of array2) {
                result.push(item1.concat(item2));
            }
        }

        return result;
    }

    // Genearte a new lookup function based on one lookup function
    private readonly CustomizedEvaluatorLookup = (baseLookup: EvaluatorLookup, isExpander: boolean) : any => (name: string) : ExpressionEvaluator => {
        const prebuiltPrefix: string = 'prebuilt.';

        if (name.startsWith(prebuiltPrefix)) {
            return baseLookup(name.substring(prebuiltPrefix.length));
        }

        if (this.TemplateMap[name] !== undefined) {
            if (isExpander) {
                return new ExpressionEvaluator(name, BuiltInFunctions.Apply(this.TemplateExpander(name)), ReturnType.String, this.ValidTemplateReference);
            } else {
                return new ExpressionEvaluator(name, BuiltInFunctions.Apply(this.TemplateEvaluator(name)), ReturnType.String, this.ValidTemplateReference);
            }
        }

        return baseLookup(name);
    }

    private readonly TemplateEvaluator = (templateName: string) : any => (args: ReadonlyArray<any>): string => {
        const newScope: any = this.ConstructScope(templateName, Array.from(args));

        const value: string[] = this.ExpandTemplate(templateName, newScope);
        const randomNumber: number = Math.floor(Math.random() * value.length);

        return value[randomNumber];
    }

    private readonly TemplateExpander = (templateName: string): any => (args: ReadonlyArray<any>): string[] => {
        const newScope: any = this.ConstructScope(templateName, Array.from(args));

        return this.ExpandTemplate(templateName, newScope);
    }

    private readonly ValidTemplateReference = (expression: Expression): void => {
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

    private ReconstructExpression(expanderExpression: Expression, evaluatorExpression: Expression, foundPrebuiltFunction: boolean): Expression {
        if (this.TemplateMap[expanderExpression.Type] !== undefined) {
            if (foundPrebuiltFunction) {
                return evaluatorExpression;
            }
        } else {
            foundPrebuiltFunction = true;
        }

        for (let i: number = 0; i < expanderExpression.Children.length; i++) {
            expanderExpression.Children[i] = this.ReconstructExpression(expanderExpression.Children[i], evaluatorExpression.Children[i], foundPrebuiltFunction);
        }

        return expanderExpression;
    }

    private evalTextContainsExpression(exp: string) : string[] {
        const templateRefValues: Map<string, string[]> = new Map<string, string[]>();
        const matches: string[] = exp.split('').reverse().join('').match(this.expressionRecognizeRegex).map((e: string) => e.split('').reverse().join('')).reverse();
        if (matches !== null && matches !== undefined) {
            for (const match of matches) {
                templateRefValues.set(match, this.EvalExpression(match));
            }
        }

        let result: string[] = [exp];
        for (const templateRefValue of templateRefValues) {
            const tempRes: string[] = [];
            for (const res of result) {
                for (const refValue of templateRefValue[1]) {
                    tempRes.push(res.replace(/@\{[^{}]+\}/, refValue));
                }
            }
            result = tempRes;
        }

        return result;
    }

    private evalText(exp: string): string[] {
        if (exp === undefined || exp.length === 0) {
            return [exp];
        }

        if (this.isPureExpression(exp)) {
            return this.EvalExpression(exp);
        } else {

            // unescape \|
            return this.evalTextContainsExpression(exp).map((x: string) => x.replace(/\\\|/g, '|'));
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
}
