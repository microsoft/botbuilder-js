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
 * Defines hasPendingActions() expression function.
 * The expression will return true if the current adaptive dialog has any pending actions.
 */
export class HasPendingActionsFunction extends ExpressionEvaluator {
    /**
     * Function identifier name.
     */
    static readonly functionName = 'hasPendingActions'; // `name` is reserved in JavaScript

    /**
     * Initializes a new instance of the [HasPendingActionsFunction](xref:botbuilder-dialogs-adaptive.HasPendingActionsFunction).
     */
    constructor() {
        super(HasPendingActionsFunction.functionName, HasPendingActionsFunction.function, ReturnType.Boolean);
    }

    private static function(expression: Expression, state: MemoryInterface, _options: Options): ValueWithError {
        const actions: unknown[] = state.getValue('dialog._adaptive.actions');
        if (actions) {
            return {
                value: actions.length > 0,
                error: undefined,
            };
        }
        return { value: false, error: undefined };
    }
}
