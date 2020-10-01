/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Dialog, TurnPath } from 'botbuilder-dialogs';
import { Expression, ExpressionParserInterface } from 'adaptive-expressions';
import { OnIntent } from './onIntent';

/**
 * Actions triggered when an Intent of "ChooseIntent" has been emitted by a recognizer.
 */
export class OnChooseIntent extends OnIntent {

    public intents: string[] = [];

    /**
     * Initializes a new instance of the `OnChooseIntent` class.
     * @param actions Optional. Actions to add to the plan when the rule constraints are met.
     * @param condition Optional. Condition which needs to be met for the actions to be executed.
     */
    public constructor(actons: Dialog[] = [], condition?: string) {
        super('ChooseIntent', [], actons, condition);
    }

    /**
     * Get the expression for this rule.
     * @param parser Used to parse a string into an `Expression`.
     * @returns Expression which will be cached and used to evaluate this rule.
     */
    public getExpression(parser: ExpressionParserInterface): Expression {
        if (this.intents.length > 0) {
            const constraints = this.intents.map((intent: string): Expression => {
                return parser.parse(`contains(jPath(${ TurnPath.recognized }, '.candidates.intent'), '${ intent }')`);
            });
            return Expression.andExpression(super.getExpression(parser), ...constraints);
        }
        return super.getExpression(parser);
    }
}
