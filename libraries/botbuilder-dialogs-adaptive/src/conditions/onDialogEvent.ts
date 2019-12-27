/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from 'botbuilder-dialogs';
import { ExpressionParserInterface, Expression, ExpressionType } from 'botframework-expressions';
import { OnCondition, OnConditionConfiguration } from './onCondition';

export interface OnDialogEventConfiguration extends OnConditionConfiguration {
    event?: string;
}

/**
 * Actions triggered when a dialog event is emitted.
 */
export class OnDialogEvent extends OnCondition {

    public static declarativeType = 'Microsoft.OnDialogEvent';

    /**
     * Gets or sets the event to fire on.
     */
    public event: string;

    /**
     * Creates a new `OnDialogEvent` instance.
     * @param event (Optional) The event to fire on.
     * @param actions (Optional) The actions to add to the plan when the rule constraints are met.
     * @param condition (Optional) The condition which needs to be met for the actions to be executed.
     */
    public constructor(event?: string, actions: Dialog[] = [], condition?: string) {
        super(condition, actions);
        this.event = event;
    }

    public configure(config: OnDialogEventConfiguration): this {
        return super.configure(config);
    }

    public getExpression(parser: ExpressionParserInterface): Expression {
        return Expression.makeExpression(ExpressionType.And, undefined,
            parser.parse(`turn.dialogEvent.name == '${ this.event }'`),
            super.getExpression(parser));
    }
}