/**
 * @module botbuilder-planning
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog } from 'botbuilder-dialogs';
import { OnCondition } from './onCondition';
import { ExpressionParserInterface, Expression, ExpressionType } from 'botframework-expressions';

/**
 * Actions triggered when a dialog event is emitted.
 */
export class OnDialogEvent extends OnCondition {
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
    constructor(event: string = null, actions: Dialog[] = [], condition: string = null) {
        super(condition, actions);
        this.event = event;
    }

    public getExpression(parser: ExpressionParserInterface): Expression {
        return Expression.makeExpression(ExpressionType.And, undefined,
            parser.parse(`turn.dialogEvent.name == '${this.event}'`),
            super.getExpression(parser));
    }

    /*
    public evaluate(sequence: SequenceContext, event: DialogEvent, preBubble: boolean): Promise<ActionChangeList[]|undefined> {
        // Limit evaluation to only supported events
        if (preBubble == this.preBubble && this.events.indexOf(event.name) >= 0) {
            return this.onEvaluate(sequence, event);
        } else {
            return undefined;
        }
    }

    protected async onEvaluate(sequence: SequenceContext, event: DialogEvent): Promise<ActionChangeList[]|undefined> {
        if (await this.onIsTriggered(sequence, event)) {
            return [this.onCreateChangeList(sequence, event)];
        }
    }

    protected async onIsTriggered(sequence: SequenceContext, event: DialogEvent): Promise<boolean> {
        return true;
    }

    protected onCreateChangeList(sequence: SequenceContext, event: DialogEvent, dialogOptions?: any): ActionChangeList {
        const changeList: ActionChangeList = { changeType: ActionChangeType.insertActions, actions: [] };
        this.actions.forEach((action) => {
            const actionState: ActionState = { dialogStack: [], dialogId: action.id };
            if (dialogOptions !== undefined) {
                actionState.options = dialogOptions;
            }
            changeList.actions.push(actionState);
        });

        return changeList;
    }
    */
}