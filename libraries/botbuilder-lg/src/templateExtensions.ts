/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';
import * as lp from './generated/LGFileParser';
import { TerminalNode } from 'antlr4ts/tree';
/**
 * Extension methods for LG.
 */
export class TemplateExtensions {

    /**
     * trim expression. ${abc} => abc,  ${a == {}} => a == {}.
     * @param expression input expression string.
     * @returns pure expression string.
     */
    public static trimExpression(expression: string): string {
        let result = expression.trim();
        if (result.startsWith('$')) {
            result = result.substr(1);
        }

        result = result.trim();
        
        if (result.startsWith('{') && result.endsWith('}')) {
            result = result.substr(1, result.length - 2);
        }

        return result.trim();
    }

    /**
     * Normalize authored path to os path.
     * path is from authored content which doesn't know what OS it is running on.
     * This method treats / and \ both as seperators regardless of OS, for windows that means / -> \ and for linux/mac \ -> /.
     * This allows author to use ../foo.lg or ..\foo.lg as equivelents for importing.
     * @param ambiguousPath authoredPath.
     * @returns path expressed as OS path.
     */
    public static normalizePath(ambiguousPath: string): string {
        if (process.platform === 'win32') {
            // map linux/mac sep -> windows
            return path.normalize(ambiguousPath.replace(/\//g, '\\'));
        } else {
            // map windows sep -> linux/mac
            return path.normalize(ambiguousPath.replace(/\\/g, '/'));
        }
    }

    /**
     * Get prefix error message from normal template sting context.
     * @param context normal template sting context.
     * @returns prefix error message.
     */
    public static getPrefixErrorMessage(context: lp.NormalTemplateStringContext): string
    {
        let errorPrefix = '';
        if (context.parent &&  context.parent.parent && context.parent.parent.parent) {
            
            if (context.parent.parent.parent instanceof lp.IfConditionRuleContext) {
                const conditionContext = context.parent.parent.parent;
                let tempMsg = '';
                if (conditionContext.ifCondition() && conditionContext.ifCondition().EXPRESSION().length > 0) {
                    tempMsg = conditionContext.ifCondition().EXPRESSION(0).text;
                    errorPrefix = `Condition '` + tempMsg + `': `;
                }
            } else {
                if (context.parent.parent.parent instanceof lp.SwitchCaseRuleContext )
                {
                    const switchCaseContext = context.parent.parent.parent;
                    var state = switchCaseContext.switchCaseStat();
                    if (state && state.DEFAULT())
                    {
                        errorPrefix = `Case 'Default':`;
                    }
                    else if (state && state.SWITCH())
                    {
                        let tempMsg = '';
                        if (state.EXPRESSION(0)) {
                            tempMsg = state.EXPRESSION(0).text;
                        }
                        errorPrefix = `Switch '${ tempMsg } ':`;
                    }
                    else if (state && state.CASE())
                    {
                        let tempMsg = '';
                        if (state.EXPRESSION(0)) {
                            tempMsg = state.EXPRESSION(0).text;
                        }
                        errorPrefix = `Case '${ tempMsg }':`;
                    }
                }
            }
        }
        

        return errorPrefix;
    }

    /**
     * If a value is pure Expression.
     * @param ctx Key value structure value context.
     */
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

    public static evalEscape(exp: string): string {
        const validCharactersDict: any = {
            '\\r': '\r',
            '\\n': '\n',
            '\\t': '\t',
            '\\\\': '\\'
        };

        return exp.replace(/\\[^\r\n]?/g, (sub: string): string => { 
            if (sub in validCharactersDict) {
                return validCharactersDict[sub];
            } else if (sub === '\\$') {
                return sub.substr(1);
            }else {
                return sub;
            }
        });
    }

    /**
     * Generate new guid string.
     */
    public static newGuid(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c: any): string => {
            const r: number = Math.random() * 16 | 0;
            const v: number = c === 'x' ? r : (r & 0x3 | 0x8);

            return v.toString(16);
        });
    }

    /**
     * read line from text.
     * @param input text content.
     */
    public static readLine(input: string): string[] {
        if (!input) {
            return [];
        }

        return input.replace(/\r\n/g, '\n').split('\n');
    }
}