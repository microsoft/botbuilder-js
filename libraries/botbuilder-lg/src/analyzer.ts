
/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line: no-submodule-imports
import { AbstractParseTreeVisitor, ParseTree, TerminalNode } from 'antlr4ts/tree';
import { Constant, Expression, Extensions, IExpressionParser } from 'botbuilder-expression';
import { ExpressionEngine} from 'botbuilder-expression-parser';
import { flatten, keyBy } from 'lodash';
import { EvaluationTarget } from './evaluator';
import * as lp from './generated/LGFileParser';
import { LGFileParserVisitor } from './generated/LGFileParserVisitor';
import { GetMethodExtensions } from './getMethodExtensions';
import { LGTemplate } from './lgTemplate';

// tslint:disable-next-line: max-classes-per-file
/**
 * Analyzer engine. To analyse which variable may be used
 */
export class Analyzer extends AbstractParseTreeVisitor<string[]> implements LGFileParserVisitor<string[]> {
    public readonly Templates: LGTemplate[];
    public readonly TemplateMap: {[name: string]: LGTemplate};
    private readonly evalutationTargetStack: EvaluationTarget[] = [];
    private readonly _expressionParser: IExpressionParser;

    constructor(templates: LGTemplate[]) {
        super();
        this.Templates = templates;
        this.TemplateMap = keyBy(templates, (t: LGTemplate) => t.Name);
        this._expressionParser = new ExpressionEngine(new GetMethodExtensions(undefined).GetMethodX);
    }

    public AnalyzeTemplate(templateName: string): string[] {
        if (!(templateName in this.TemplateMap)) {
            throw new Error(`No such template: ${templateName}`);
        }

        if (this.evalutationTargetStack.find((u: EvaluationTarget) => u.TemplateName === templateName) !== undefined) {
            throw new Error(`Loop deteced: ${this.evalutationTargetStack.reverse()
                .map((u: EvaluationTarget) => u.TemplateName)
                .join(' => ')}`);
        }

        // Using a stack to track the evalution trace
        this.evalutationTargetStack.push(new EvaluationTarget(templateName, undefined));
        const rawDependencies: string[] = this.visit(this.TemplateMap[templateName].ParseTree);

        // we don't exclude paratemters any more
        // because given we don't track down for templates have paramters
        // the only scenario that we are still analyzing an paramterized template is
        // this template is root template to anaylze, in this we also don't have exclude paramters
        const dependencies: string[] = Array.from(new Set(rawDependencies));
        this.evalutationTargetStack.pop();

        return dependencies;
    }

    public visitTemplateDefinition(ctx: lp.TemplateDefinitionContext): string[] {
        const templateNameContext: lp.TemplateNameLineContext = ctx.templateNameLine();
        if (templateNameContext.templateName().text === this.currentTarget().TemplateName) {
            if (ctx.templateBody() !== undefined) {
                return this.visit(ctx.templateBody());
            }
        }

        throw Error(`template name match failed`);
    }

    public visitNormalBody(ctx: lp.NormalBodyContext): string[] {
        return this.visit(ctx.normalTemplateBody());
    }

    public visitNormalTemplateBody(ctx: lp.NormalTemplateBodyContext) : string[] {
        let result: string[] = [];
        for (const templateStr of ctx.normalTemplateString()) {
            result = result.concat(this.visit(templateStr));
        }

        return result;
    }

    public visitConditionalBody(ctx: lp.ConditionalBodyContext): string[] {
        let result: string[] = [];

        const ifRules: lp.IfConditionRuleContext[] = ctx.conditionalTemplateBody().ifConditionRule();
        for (const ifRule of ifRules) {
            const expressions: TerminalNode[] = ifRule.ifCondition().EXPRESSION();
            if (expressions !== undefined && expressions.length > 0) {
                result = result.concat(this.AnalyzeExpression(expressions[0].text));
            }
            if (ifRule.normalTemplateBody() !== undefined) {
                result = result.concat(this.visit(ifRule.normalTemplateBody()));
            }
        }

        return result;
    }

    public visitNormalTemplateString(ctx: lp.NormalTemplateStringContext): string[] {
        let result: string[] = [];
        for (const node of ctx.children) {
            const innerNode: TerminalNode =  node as TerminalNode;
            switch (innerNode.symbol.type) {
                case lp.LGFileParser.DASH: break;
                case lp.LGFileParser.EXPRESSION: {
                    result = result.concat(this.AnalyzeExpression(innerNode.text));
                    break;
                }
                case lp.LGFileParser.TEMPLATE_REF: {
                    result = result.concat(this.AnalyzeTemplateRef(innerNode.text));
                    break;
                }
                case lp.LGFileParser.MULTI_LINE_TEXT: {
                    result = result.concat(this.AnalyzeMultiLineText(innerNode.text));
                    break;
                }
                default: {
                    break;
                }
            }
        }

        return result;
    }

    protected defaultResult(): string[] {
        return [];
    }

    private AnalyzeExpression(exp: string): string[] {
        exp = exp.replace(/(^{*)/g, '')
                .replace(/(}*$)/g, '');
        const parse: Expression = this._expressionParser.parse(exp);
        const references: Set<string> = new Set<string>();

        const path: string = Extensions.ReferenceWalk(parse, references, (expression: Expression) => {
            let found: boolean = false;
            if (expression instanceof Constant && typeof (expression).Value === 'string') {
                const str: string = (expression).Value;
                if (str.startsWith('[') && str.endsWith(']')) {
                    found = true;
                    this.AnalyzeTemplateRef(str).forEach((x: string) => references.add(x));
                } else if (str.startsWith('{') && str.endsWith('}')) {
                    found = true;
                    for (const childRef of this.AnalyzeExpression(str)) {
                        references.add(childRef);
                    }
                } else if (str in this.TemplateMap) {
                    found = true;
                    this.AnalyzeTemplateRef(str).forEach((x: string) => references.add(x));
                }
            }

            return found;
        });

        if (path !== undefined) {
            references.add(path);
        }

        return Array.from(references);
    }

    private AnalyzeTemplateRef(exp: string): string[] {
        exp = exp.replace(/(^\[*)/g, '')
                .replace(/(\]*$)/g, '');
        const argsStartPos: number = exp.indexOf('(');
        if (argsStartPos > 0) { // Do have args

            // evaluate all arguments using ExpressoinEngine
            const argsEndPos: number = exp.lastIndexOf(')');

            if (argsEndPos < 0 || argsEndPos < argsStartPos + 1) {
                throw Error(`Not a valid template ref: ${exp}`);
            }

            const args: string[] = exp.substr(argsStartPos + 1, argsEndPos - argsStartPos - 1).split(',');

            // Before we have a matural solution to analyze paramterized template, we stop digging into
            // templates with paramters, we just analyze it's args.
            // With this approach we may not get a very fine-grained result
            // but the result will still be accurate
            return flatten(args.map((arg: string) => this.AnalyzeExpression(arg)));
        } else {
            // We analyze tempalte only if the template has no formal parameters
            if (this.TemplateMap[exp].Parameters === undefined || this.TemplateMap[exp].Parameters.length === 0) {
                return this.AnalyzeTemplate(exp);
            } else {
                return [];
            }
        }
    }

    private AnalyzeMultiLineText(exp: string): string[] {
        let result: string[] = [];
        exp = exp.substr(3, exp.length - 6);
        const matches: string[] = exp.match(/@\{[^{}]+\}/g);
        for (const match of matches) {
            const newExp: string = match.substr(1); // remove @
            if (newExp.startsWith('{[') && newExp.endsWith(']}')) {
                result = result.concat(this.AnalyzeTemplateRef(newExp.substr(2, newExp.length - 4)));
            } else {
                result = result.concat(this.AnalyzeExpression(newExp));
            }
        }

        return result;
    }

    private currentTarget(): EvaluationTarget {
        return this.evalutationTargetStack[this.evalutationTargetStack.length - 1];
    }
}
