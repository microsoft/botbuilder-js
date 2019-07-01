
/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line: no-submodule-imports
import { AbstractParseTreeVisitor, TerminalNode } from 'antlr4ts/tree';
import { Expression } from 'botbuilder-expression';
import { ExpressionEngine} from 'botbuilder-expression-parser';
import { keyBy } from 'lodash';
import * as lp from './generated/LGFileParser';
import { LGFileParserVisitor } from './generated/LGFileParserVisitor';
import { GetMethodExtensions, IGetMethod } from './getMethodExtensions';
import { LGTemplate } from './lgTemplate';

/**
 * Runtime template context store
 */
export class EvaluationTarget {
    public TemplateName: string;
    public Scope: any;
    public constructor(templateName: string, scope: any) {
        this.TemplateName = templateName;
        this.Scope = scope;
    }
}

/**
 * Evaluation tuntime engine
 */
// tslint:disable-next-line: max-classes-per-file
export class Evaluator extends AbstractParseTreeVisitor<string> implements LGFileParserVisitor<string> {
    public readonly Templates: LGTemplate[];
    public readonly TemplateMap: {[name: string]: LGTemplate};
    private readonly evalutationTargetStack: EvaluationTarget[] = [];

    private readonly GetMethodX: IGetMethod;

    constructor(templates: LGTemplate[], getMethod: IGetMethod) {
        super();
        this.Templates = templates;
        this.TemplateMap = keyBy(templates, (t: LGTemplate) => t.Name);
        this.GetMethodX = getMethod === undefined ? new GetMethodExtensions(this) : getMethod;
    }

    public EvaluateTemplate(templateName: string, scope: any): string {
        if (!(templateName in this.TemplateMap)) {
            throw new Error(`No such template: ${templateName}`);
        }

        if (this.evalutationTargetStack.find((u: EvaluationTarget) => u.TemplateName === templateName) !== undefined) {
            throw new Error(`Loop deteced: ${this.evalutationTargetStack.reverse()
                .map((u: EvaluationTarget) => u.TemplateName)
                .join(' => ')}`);
        }

        // Using a stack to track the evalution trace
        this.evalutationTargetStack.push(new EvaluationTarget(templateName, scope));
        const result: string = this.visit(this.TemplateMap[templateName].ParseTree);
        this.evalutationTargetStack.pop();

        return result;
    }

    public visitTemplateDefinition(ctx: lp.TemplateDefinitionContext): string {
        const templateNameContext: lp.TemplateNameLineContext = ctx.templateNameLine();
        if (templateNameContext.templateName().text === this.currentTarget().TemplateName) {
            return this.visit(ctx.templateBody());
        }

        return undefined;
    }

    public visitNormalBody(ctx: lp.NormalBodyContext): string {
        return this.visit(ctx.normalTemplateBody());
    }

    public visitNormalTemplateBody(ctx: lp.NormalTemplateBodyContext) : string {
        const normalTemplateStrs: lp.NormalTemplateStringContext[] = ctx.normalTemplateString();
        // tslint:disable-next-line: insecure-random
        const randomNumber: number = Math.floor(Math.random() * normalTemplateStrs.length);

        return this.visit(normalTemplateStrs[randomNumber]);
    }

    public visitIfElseBody(ctx: lp.IfElseBodyContext) : string {
        const ifRules: lp.IfConditionRuleContext[] = ctx.ifElseTemplateBody().ifConditionRule();
        for (const ifRule of ifRules) {
            if (this.EvalCondition(ifRule.ifCondition()) && ifRule.normalTemplateBody() !== undefined) {
                return this.visit(ifRule.normalTemplateBody());
            }
        }

        return undefined;
    }

    public visitNormalTemplateString(ctx: lp.NormalTemplateStringContext): string {
        let result: string = '';
        for (const node of ctx.children) {
            const innerNode: TerminalNode =  <TerminalNode>node;
            switch (innerNode.symbol.type) {
                case lp.LGFileParser.DASH: break;
                case lp.LGFileParser.ESCAPE_CHARACTER:
                    result = result.concat(this.EvalEscapeCharacter(innerNode.text));
                    break;
                case lp.LGFileParser.EXPRESSION: {
                    result = result.concat(this.EvalExpression(innerNode.text));
                    break;
                }
                case lp.LGFileParser.TEMPLATE_REF: {
                    result = result.concat(this.EvalTemplateRef(innerNode.text));
                    break;
                }
                case lp.LGFileParser.MULTI_LINE_TEXT: {
                    result = result.concat(this.EvalMultiLineText(innerNode.text));
                    break;
                }
                default: {
                    result = result.concat(innerNode.text);
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

        if (args.length === 1 && parameters.length === 0) {
            // Special case, if no parameters defined, and only one arg, don't wrap
            // this is for directly calling an parameterized template
            return args[0];
        }

        if (parameters !== undefined && (args === undefined || parameters.length !== args.length)) {
            throw new Error(`The length of required parameters does not match the length of provided parameters.`);
        }

        const newScope: any = {};
        parameters.map((e: string, i: number) => newScope[e] = args[i]);

        return newScope;
    }

    public visitSwitchCaseBody(ctx: lp.SwitchCaseBodyContext) : string {
        const switchcaseNodes: lp.SwitchCaseRuleContext[] = ctx.switchCaseTemplateBody().switchCaseRule();
        const length: number = switchcaseNodes.length;
        const switchNode: lp.SwitchCaseRuleContext = switchcaseNodes[0];
        const switchExprs: TerminalNode[] = switchNode.switchCaseStat().EXPRESSION();
        const switchExprResult: string = this.EvalExpression(switchExprs[0].text);
        let idx: number = 0;
        for (const caseNode of switchcaseNodes) {
            if (idx === 0) {
                idx = idx + 1;
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
            const caseExprResult: string = this.EvalExpression(caseExprs[0].text);
            if (switchExprResult === caseExprResult) {
                return this.visit(caseNode.normalTemplateBody());
            }

            idx = idx + 1;
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
        const expressions: TerminalNode[] = condition.EXPRESSION(); // Here ts is diff with C#, C# use condition.EXPRESSION(0) == null
                                                                    // to judge ELSE condition. But in ts lib this action would throw
                                                                    // Error

        if (expressions === undefined || expressions.length === 0) {
            return true;                                            // no expression means it's else
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

            const {value: result, error}: {value: any; error: string} = this.EvalByExpressionEngine(exp, this.currentTarget().Scope);
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

    private EvalExpression(exp: string): string {
        exp = exp.replace(/(^@*)/g, '')
                .replace(/(^{*)/g, '')
                .replace(/(}*$)/g, '');

        const {value: result, error}: {value: any; error: string} = this.EvalByExpressionEngine(exp, this.currentTarget().Scope);
        if (error !== undefined) {
            throw new Error(`Error occurs when evaluating expression ${exp}: ${error}`);
        }
        if (result === undefined) {
            throw new Error(`Error occurs when evaluating expression '${exp}': ${exp} is evaluated to null`);
        }

        return String(result);
    }

    private EvalTemplateRef(exp: string) : string {
        exp = exp.replace(/(^\[*)/g, '')
                .replace(/(\]*$)/g, '');
        const argsStartPos: number = exp.indexOf('(');
        if (argsStartPos > 0) {// Do have args

            // EvaluateTemplate all arguments using ExpressoinEngine
            const argsEndPos: number = exp.lastIndexOf(')');
            if (argsEndPos < 0 || argsEndPos < argsStartPos + 1) {
                throw new Error(`Not a valid template ref: ${exp}`);
            }

            const argExpressions: string[] = exp.substr(argsStartPos + 1, argsEndPos - argsStartPos - 1).split(',');
            const args: string[] = argExpressions.map((x: string) => this.EvalByExpressionEngine(x, this.currentTarget().Scope).value);

            // Construct a new Scope for this template reference
            // Bind all arguments to parameters
            const templateName: string = exp.substr(0, argsStartPos);

            const newScope: any = this.ConstructScope(templateName, args);

            return this.EvaluateTemplate(templateName, newScope);
        }

        return this.EvaluateTemplate(exp, this.currentTarget().Scope);
    }

    private EvalMultiLineText(exp: string): string {

        exp = exp.substr(3, exp.length - 6); //remove ``` ```

        return exp.replace(/@\{[^{}]+\}/g, (sub: string) => this.EvalExpression(sub));
    }

    private EvalByExpressionEngine(exp: string, scope: any) : {value: any; error: string} {
        const parse: Expression = new ExpressionEngine(this.GetMethodX.GetMethodX).parse(exp);

        return parse.tryEvaluate(scope);
    }
}
