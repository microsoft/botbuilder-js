/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Expression } from 'adaptive-expressions';
import { RecognizerResult } from 'botbuilder';
import { Dialog, TurnPath } from 'botbuilder-dialogs';
import { OnDialogEvent, OnDialogEventConfiguration } from './onDialogEvent';
import { ActionContext } from '../actionContext';
import { AdaptiveEvents } from '../adaptiveEvents';
import { ActionChangeList } from '../actionChangeList';
import { ActionState } from '../actionState';
import { ActionChangeType } from '../actionChangeType';

export interface OnIntentConfiguration extends OnDialogEventConfiguration {
    intent?: string;
    entities?: string[];
}

/**
 * Actions triggered when an Activity has been received and the recognized intents and entities match specified list of intent and entity filters.
 */
export class OnIntent extends OnDialogEvent implements OnIntentConfiguration {
    static $kind = 'Microsoft.OnIntent';

    /**
     * Gets or sets intent to match on.
     */
    intent: string;

    /**
     * Gets or sets entities which must be recognized for this rule to trigger.
     */
    entities: string[];

    /**
     * Creates a new `OnIntent` instance.
     *
     * @param intent (Optional) Intent to match on.
     * @param entities (Optional) Entities which must be recognized for this rule to trigger.
     * @param actions (Optional) The actions to add to the plan when the rule constraints are met.
     * @param condition (Optional) The condition which needs to be met for the actions to be executed.
     */
    constructor(intent?: string, entities: string[] = [], actions: Dialog[] = [], condition?: string) {
        super(AdaptiveEvents.recognizedIntent, actions, condition);
        this.intent = intent;
        this.entities = entities;
    }

    /**
     * Create the expression for this condition.
     *
     * @returns [Expression](xref:adaptive-expressions.Expression) used to evaluate this rule.
     */
    protected createExpression(): Expression {
        if (!this.intent) {
            throw new Error('Intent cannot be null.');
        }

        const trimmedIntent = this.intent.startsWith('#') ? this.intent.substring(1) : this.intent;
        let intentExpression = Expression.parse(`${TurnPath.recognized}.intent == '${trimmedIntent}'`);

        if (this.entities.length > 0) {
            intentExpression = Expression.andExpression(
                intentExpression,
                Expression.andExpression(
                    ...this.entities.map((entity) => {
                        if (entity.startsWith('@') || entity.startsWith(TurnPath.recognized)) {
                            return Expression.parse(`exists(${entity})`);
                        }
                        return Expression.parse(`exists(@${entity})`);
                    })
                )
            );
        }

        return Expression.andExpression(intentExpression, super.createExpression());
    }

    /**
     * @protected
     * Called when a change list is created.
     * @param actionContext [ActionContext](xref:botbuilder-dialogs-adaptive.ActionContext) to use for evaluation.
     * @param dialogOptions Optional. Object with dialog options.
     * @returns An [ActionChangeList](xref:botbuilder-dialogs-adaptive.ActionChangeList) with the list of actions.
     */
    protected onCreateChangeList(actionContext: ActionContext, dialogOptions?: any): ActionChangeList {
        const recognizerResult = actionContext.state.getValue<RecognizerResult>(`${TurnPath.dialogEvent}.value`);
        if (recognizerResult) {
            const actionState: ActionState = {
                dialogId: this.actionScope.id,
                options: dialogOptions,
                dialogStack: [],
            };

            const changeList: ActionChangeList = {
                changeType: ActionChangeType.insertActions,
                actions: [actionState],
                turn: {},
            };

            return changeList;
        }

        return super.onCreateChangeList(actionContext, dialogOptions);
    }
}
