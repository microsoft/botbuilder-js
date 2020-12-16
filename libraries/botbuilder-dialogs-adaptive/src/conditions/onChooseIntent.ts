/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from 'adaptive-expressions';
import { Dialog, TurnPath } from 'botbuilder-dialogs';
import { OnIntent, OnIntentConfiguration } from './onIntent';

export interface OnChooseIntentConfiguration extends OnIntentConfiguration {
    intents?: string[];
}

/**
 * Actions triggered when an Intent of "ChooseIntent" has been emitted by a [Recognizer](xref:botbuilder-dialogs-adaptive.Recognizer).
 */
export class OnChooseIntent extends OnIntent implements OnChooseIntentConfiguration {
    public static $kind = 'Microsoft.OnChooseIntent';

    public intents: string[] = [];

    /**
     * Initializes a new instance of the [OnChooseIntent](xref:botbuilder-dialogs-adaptive.OnChooseIntent) class.
     * @param actions Optional. A [Dialog](xref:botbuilder-dialogs.Dialog) list containing the actions to add to the plan when the rule constraints are met.
     * @param condition Optional. Condition which needs to be met for the actions to be executed.
     */
    public constructor(actons: Dialog[] = [], condition?: string) {
        super('ChooseIntent', [], actons, condition);
    }

    /**
     * Create the expression for this rule.
     *
     * @returns {Expression} [Expression](xref:adaptive-expressions.Expression) used to evaluate this rule.
     */
    public createExpression(): Expression {
        if (this.intents?.length) {
            const constraints = this.intents.map(
                (intent: string): Expression => {
                    return Expression.parse(
                        `contains(jPath(${TurnPath.recognized}, '.candidates.intent'), '${intent}')`
                    );
                }
            );
            return Expression.andExpression(super.createExpression(), ...constraints);
        }
        return super.createExpression();
    }
}
