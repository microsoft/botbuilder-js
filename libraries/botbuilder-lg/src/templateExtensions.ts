/* eslint-disable security/detect-object-injection */
/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';
import { ParserRuleContext } from 'antlr4ts';
import { Position } from './position';
import { Range } from './range';
import { v4 as uuidv4 } from 'uuid';

import {
    IfConditionRuleContext,
    KeyValueStructureValueContext,
    NormalTemplateStringContext,
    SwitchCaseRuleContext,
} from './generated/LGTemplateParser';

/**
 * Extension methods for LG.
 */
export class TemplateExtensions {
    /**
     * Trim expression. ${abc} => abc,  ${a == {}} => a == {}.
     * @param expression Input expression string.
     * @returns Pure expression string.
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
     * @param ambiguousPath AuthoredPath.
     * @returns Path expressed as OS path.
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
     * @param context Normal template sting context.
     * @returns Prefix error message.
     */
    public static getPrefixErrorMessage(context: NormalTemplateStringContext): string {
        let errorPrefix = '';
        if (context.parent && context.parent.parent && context.parent.parent.parent) {
            if (context.parent.parent.parent instanceof IfConditionRuleContext) {
                const conditionContext = context.parent.parent.parent;
                let tempMsg = '';
                if (conditionContext.ifCondition() && conditionContext.ifCondition().expression().length > 0) {
                    tempMsg = conditionContext.ifCondition().expression(0).text;
                    errorPrefix = `Condition '` + tempMsg + `': `;
                }
            } else {
                if (context.parent.parent.parent instanceof SwitchCaseRuleContext) {
                    const switchCaseContext = context.parent.parent.parent;
                    const state = switchCaseContext.switchCaseStat();
                    if (state && state.DEFAULT()) {
                        errorPrefix = `Case 'Default':`;
                    } else if (state && state.SWITCH()) {
                        let tempMsg = '';
                        if (state.expression(0)) {
                            tempMsg = state.expression(0).text;
                        }
                        errorPrefix = `Switch '${tempMsg} ':`;
                    } else if (state && state.CASE()) {
                        let tempMsg = '';
                        if (state.expression(0)) {
                            tempMsg = state.expression(0).text;
                        }
                        errorPrefix = `Case '${tempMsg}':`;
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
    public static isPureExpression(ctx: KeyValueStructureValueContext): boolean {
        if (ctx.expressionInStructure() === undefined || ctx.expressionInStructure().length != 1) {
            return false;
        }

        return ctx.expressionInStructure(0).text.trim() === ctx.text.trim();
    }

    /**
     * Escape \ from text.
     * @param exp Input text.
     * @returns Escaped text.
     */
    public static evalEscape(exp: string): string {
        const validCharactersDict: Record<string, string> = {
            '\\r': '\r',
            '\\n': '\n',
            '\\t': '\t',
            '\\\\': '\\',
        };

        return exp.replace(/\\[^\r\n]?/g, (sub: string): string => {
            if (sub in validCharactersDict) {
                return validCharactersDict[sub];
            } else if (sub === '\\$') {
                return sub.substr(1);
            } else if (sub === '\\`') {
                return sub.substr(1);
            } else {
                return sub;
            }
        });
    }

    /**
     * Generate new guid string.
     */
    public static newGuid(): string {
        return uuidv4();
    }

    /**
     * read line from text.
     * @param input Text content.
     */
    public static readLine(input: string): string[] {
        if (!input) {
            return [];
        }

        return input.replace(/\r\n/g, '\n').split('\n');
    }

    /**
     * Convert antlr parser into Range.
     * @param context Antlr parse context.
     * @param [lineOffset] Line offset.
     * @returns Range object.
     */
    public static convertToRange(context: ParserRuleContext, lineOffset?: number): Range {
        if (!lineOffset) {
            lineOffset = 0;
        }
        if (!context) {
            return Range.DefaultRange;
        }

        const startPosition = new Position(lineOffset + context.start.line, context.start.charPositionInLine);
        const stopPosition = new Position(
            lineOffset + context.stop.line,
            context.stop.charPositionInLine + context.stop.text.length
        );

        return new Range(startPosition, stopPosition);
    }
}
