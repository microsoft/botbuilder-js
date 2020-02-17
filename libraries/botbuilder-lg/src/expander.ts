
/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line: no-submodule-imports
import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import { BuiltInFunctions, EvaluatorLookup, Expression, ExpressionEngine, ExpressionEvaluator, ReturnType } from 'botframework-expressions';
import { keyBy } from 'lodash';
import { v4 as uuid } from 'uuid';
import { EvaluationTarget } from './evaluationTarget';
import { Evaluator } from './evaluator';
import * as lp from './generated/LGFileParser';
import { LGFileParserVisitor } from './generated/LGFileParserVisitor';
import { LGTemplate } from './lgTemplate';

// tslint:disable-next-line: max-classes-per-file
// tslint:disable-next-line: completed-docs
export class Expander extends AbstractParseTreeVisitor<string[]> implements LGFileParserVisitor<string[]> {
    public readonly templates: LGTemplate[];
    public readonly templateMap: {[name: string]: LGTemplate};
    private readonly evalutationTargetStack: EvaluationTarget[] = [];
    private readonly expanderExpressionEngine: ExpressionEngine;
    private readonly evaluatorExpressionEngine: ExpressionEngine;

    public constructor(templates: LGTemplate[], expressionEngine: ExpressionEngine) {
        super();
        this.templates = templates;
        this.templateMap = keyBy(templates, (t: LGTemplate): string => t.name);

        // generate a new customzied expression engine by injecting the template as functions
        this.expanderExpressionEngine = new ExpressionEngine(this.customizedEvaluatorLookup(expressionEngine.EvaluatorLookup, true));
        this.evaluatorExpressionEngine = new ExpressionEngine(this.customizedEvaluatorLookup(expressionEngine.EvaluatorLookup, false));
    }

    public expandTemplate(templateName: string, scope: any): string[] {
        if (!(templateName in this.templateMap)) {
            throw new Error(`No such template: ${ templateName }`);
        }

        if (this.evalutationTargetStack.find((u: EvaluationTarget): boolean => u.templateName === templateName)) {
            throw new Error(`Loop deteced: ${ this.evalutationTargetStack.reverse()
                .map((u: EvaluationTarget): string => u.templateName)
                .join(' => ') }`);
        }
        // Using a stack to track the evalution trace
        this.evalutationTargetStack.push(new EvaluationTarget(templateName, scope));
        const result: string[] = this.visit(this.templateMap[templateName].parseTree);
        this.evalutationTargetStack.pop();

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

    // tslint:disable-next-line: cyclomatic-complexity
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
                        const id = this.newGuid();
                        valueList.push(id);
                        templateRefValues.set(id, item);
                    }

                    expandedResult.forEach(x => x[property] = valueList);
                } else {
                    const id = this.newGuid();
                    expandedResult.forEach(x => x[property] = id);
                    templateRefValues.set(id, value[0]);
                }
            } else {
                const propertyObjects: object[] = [];
                this.evalExpression(body.objectStructureLine().text).forEach(x => propertyObjects.push(JSON.parse(x)));
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
                for (const refValue of templateRefValues.get(templateRefValueKey)){
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
            if (Evaluator.isPureExpression(item).hasExpr) {
                result.push(this.evalExpression(Evaluator.isPureExpression(item).expression));
            } else {
                let itemStringResult = [''];
                for (const node of item.children) {
                    switch ((node as TerminalNode).symbol.type) {
                        case (lp.LGFileParser.ESCAPE_CHARACTER_IN_STRUCTURE_BODY):
                            itemStringResult = this.stringArrayConcat(itemStringResult, [this.evalEscape(node.text)]);
                            break;
                        case (lp.LGFileParser.EXPRESSION_IN_STRUCTURE_BODY):
                            itemStringResult = this.stringArrayConcat(itemStringResult, this.evalExpression(node.text));
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
        const switchExprResult: string[] = this.evalExpression(switchExprs[0].text);
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
            const caseExprResult: string[] = this.evalExpression(caseExprs[0].text);
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
            const innerNode: TerminalNode =  node as TerminalNode;
            switch (innerNode.symbol.type) {
                case lp.LGFileParser.MULTILINE_PREFIX:
                case lp.LGFileParser.MULTILINE_SUFFIX:
                case lp.LGFileParser.DASH:
                    break;
                case lp.LGFileParser.ESCAPE_CHARACTER:
                    result = this.stringArrayConcat(result, [this.evalEscape(innerNode.text)]);
                    break;
                case lp.LGFileParser.EXPRESSION: {
                    result = this.stringArrayConcat(result, this.evalExpression(innerNode.text));
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

        if (parameters && (args === undefined || parameters.length !== args.length)) {
            throw new Error(`The length of required parameters does not match the length of provided parameters.`);
        }

        const newScope: any = {};
        parameters.map((e: string, i: number): any => newScope[e] = args[i]);

        return newScope;
    }

    protected defaultResult(): string[] {
        return [];
    }

    private currentTarget(): EvaluationTarget {
        return this.evalutationTargetStack[this.evalutationTargetStack.length - 1];
    }

    private evalEscape(exp: string): string {
        const validCharactersDict: any = {
            '\\r': '\r',
            '\\n': '\n',
            '\\t': '\t',
            '\\\\': '\\',
        };

        return exp.replace(/\\[^\r\n]?/g, (sub: string): string => { 
            if (sub in validCharactersDict) {
                return validCharactersDict[sub];
            } else {
                return sub.substr(1);
            }
        });
    }

    private evalCondition(condition: lp.IfConditionContext): boolean {
        const expressions: TerminalNode[] = condition.EXPRESSION();
        if (!expressions || expressions.length === 0) {
            return true;    // no expression means it's else
        }

        if (this.evalExpressionInCondition(expressions[0].text)) {
            return true;
        }

        return false;
    }

    private evalExpressionInCondition(exp: string): boolean {
        try {
            exp = exp.replace(/(^\$*)/g, '')
                .replace(/(^{*)/g, '')
                .replace(/(}*$)/g, '');

            const { value: result, error }: { value: any; error: string } = this.evalByExpressionEngine(exp, this.currentTarget().scope);
            if (error
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

    private evalExpression(exp: string): string[] {
        exp = exp.replace(/(^\$*)/g, '')
            .replace(/(^{*)/g, '')
            .replace(/(}*$)/g, '');

        const { value: result, error }: { value: any; error: string } = this.evalByExpressionEngine(exp, this.currentTarget().scope);
        if (error) {
            throw new Error(`Error occurs when evaluating expression ${ exp }: ${ error }`);
        }
        if (result === undefined) {
            throw new Error(`Error occurs when evaluating expression '${ exp }': ${ exp } is evaluated to null`);
        }

        if (Array.isArray(result)) {
            return result;
        } else {
            return [result.toString()];
        }
    }

    private evalByExpressionEngine(exp: string, scope: any): any {
        const expanderExpression: Expression = this.expanderExpressionEngine.parse(exp);
        const evaluatorExpression: Expression = this.evaluatorExpressionEngine.parse(exp);
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

    // Genearte a new lookup function based on one lookup function
    private readonly customizedEvaluatorLookup = (baseLookup: EvaluatorLookup, isExpander: boolean): any => (name: string): ExpressionEvaluator => {
        const prebuiltPrefix = 'prebuilt.';

        if (name.startsWith(prebuiltPrefix)) {
            return baseLookup(name.substring(prebuiltPrefix.length));
        }

        if (this.templateMap[name]) {
            if (isExpander) {
                return new ExpressionEvaluator(name, BuiltInFunctions.apply(this.templateExpander(name)), ReturnType.String, this.validTemplateReference);
            } else {
                return new ExpressionEvaluator(name, BuiltInFunctions.apply(this.templateEvaluator(name)), ReturnType.String, this.validTemplateReference);
            }
        }

        return baseLookup(name);
    }

    private readonly templateEvaluator = (templateName: string): any => (args: readonly any[]): string => {
        const newScope: any = this.constructScope(templateName, Array.from(args));

        const value: string[] = this.expandTemplate(templateName, newScope);
        // tslint:disable-next-line: insecure-random
        const randomNumber: number = Math.floor(Math.random() * value.length);

        return value[randomNumber];
    }

    private readonly templateExpander = (templateName: string): any => (args: readonly any[]): string[] => {
        const newScope: any = this.constructScope(templateName, Array.from(args));

        return this.expandTemplate(templateName, newScope);
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

    private newGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: any): string => {
            const r: number = Math.random() * 16 | 0;
            // tslint:disable-next-line: no-bitwise
            const v: number = c === 'x' ? r : (r & 0x3 | 0x8);

            return v.toString(16);
        });
    }
}
