/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { OnDialogEvent } from './onDialogEvent';
import { AdaptiveEventNames } from '../sequenceContext';
import { Dialog } from 'botbuilder-dialogs';
import { ExpressionParserInterface, Expression, ExpressionType } from 'botframework-expressions';

/**
 * Actions triggered when an Activity has been received and the recognized intents and entities match specified list of intent and entity filters.
 */
export class OnIntent extends OnDialogEvent {

    /**
     * Gets or sets intent to match on.
     */
    public intent: string;

    /**
     * Gets or sets entities which must be recognized for this rule to trigger.
     */
    public entities: string[];

    /**
     * Creates a new `OnIntent` instance.
     * @param intent (Optional) Intent to match on.
     * @param entities (Optional) Entities which must be recognized for this rule to trigger.
     * @param actions (Optional) The actions to add to the plan when the rule constraints are met.
     * @param condition (Optional) The condition which needs to be met for the actions to be executed.
     */
    constructor(intent: string = null, entities: string[] = [], actions: Dialog[] = [], condition: string = null) {
        super(AdaptiveEventNames.recognizedIntent, actions, condition);
        this.intent = intent;
        this.entities = entities;
    }

    public getExpression(parser: ExpressionParserInterface): Expression {
        if (!this.intent) {
            throw new Error('Intent cannot be null.');
        }

        const trimmedIntent = this.intent.startsWith('#') ? this.intent.substring(1) : this.intent;
        let intentExpression = parser.parse(`turn.recognized.intent == '${trimmedIntent}'`)

        if (this.entities.length > 0) {
            intentExpression = Expression.makeExpression(ExpressionType.And, undefined, intentExpression,
                Expression.makeExpression(ExpressionType.And, undefined, ...this.entities.map(entity => {
                    if (entity.startsWith('@') || entity.startsWith('turn.recognized')) {
                        return parser.parse(`exists(${entity})`);
                    }
                    return parser.parse(`exists(@${entity})`);
                })));
        }

        return Expression.makeExpression(ExpressionType.And, undefined, intentExpression, super.getExpression(parser));
    }
}