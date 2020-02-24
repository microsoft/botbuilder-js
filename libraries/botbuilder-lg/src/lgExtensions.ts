/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as path from 'path';
import * as lp from './generated/LGFileParser';
/**
 * Extension methods for LG.
 */
export class LGExtensions {

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

    /// <summary>
    /// Normalize authored path to os path.
    /// </summary>
    /// <remarks>
    /// path is from authored content which doesn't know what OS it is running on.
    /// This method treats / and \ both as seperators regardless of OS, for windows that means / -> \ and for linux/mac \ -> /.
    /// This allows author to use ../foo.lg or ..\foo.lg as equivelents for importing.
    /// </remarks>
    /// <param name="ambiguousPath">authoredPath.</param>
    /// <returns>path expressed as OS path.</returns>
    public static normalizePath(ambiguousPath: string): string {
        if (process.platform === 'win32') {
            // map linux/mac sep -> windows
            return path.normalize(ambiguousPath.replace(/\//g, '\\'));
        } else {
            // map windows sep -> linux/mac
            return path.normalize(ambiguousPath.replace(/\\/g, '/'));
        }
    }

    /// <summary>
    /// Get prefix error message from normal template sting context.
    /// </summary>
    /// <param name="context">normal template sting context.</param>
    /// <returns>prefix error message.</returns>
    public static getPrefixErrorMessage(context: lp.NormalTemplateStringContext): string
    {
        let errorPrefix = '';
        if(context.parent &&  context.parent.parent && context.parent.parent.parent){
            if (context.parent.parent.parent instanceof lp.IfConditionRuleContext) {
                const conditionContext = context.parent.parent.parent;
                let tempMsg = '';
                const tempCtx = conditionContext.ifCondition();
                if (conditionContext.ifCondition() && conditionContext.ifCondition().EXPRESSION().length > 1) {
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
}