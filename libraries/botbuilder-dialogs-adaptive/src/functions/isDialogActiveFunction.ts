/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import {
    Expression,
    ExpressionEvaluator,
    MemoryInterface,
    Options,
    ReturnType,
    ValueWithError,
} from 'adaptive-expressions';

/**
 * Defines isDialogActive(id) expression function.
 * This expression will return true if any of the dialog ids is on the dialog execution stack.
 *
 * @example isDialogActive('dialog1')
 * @example isDialogActive('dialog1', 'dialog2', 'dialog3')
 */
export class IsDialogActiveFunction extends ExpressionEvaluator {
    /**
     * Function identifier name.
     */
    static readonly functionName = 'isDialogActive'; // `name` is reserved in JavaScript.

    /**
     * Function identifier alias.
     */
    static readonly functionAlias = 'isActionActive';

    /**
     * Intializes a new instance of the [IsDialogActiveFunction](xref:botbuilder-dialogs-adaptive.IsDialogActiveFunction) class.
     */
    constructor() {
        super(IsDialogActiveFunction.functionName, IsDialogActiveFunction.function, ReturnType.Boolean);
    }

    private static function(expression: Expression, state: MemoryInterface, options: Options): ValueWithError {
        const stack: string[] = state.getValue('dialogcontext.stack');
        if (!stack) {
            return { value: undefined, error: 'dialogcontext.stack not found' };
        }

        try {
            const args: string[] = expression.children.map((child) => {
                const { value, error } = child.tryEvaluate(state, options);
                if (error) {
                    throw error;
                }
                return value;
            });
            return {
                value: stack.some((dlg) => args.includes(dlg)),
                error: undefined,
            };
        } catch (error) {
            return { value: undefined, error };
        }
    }
}
