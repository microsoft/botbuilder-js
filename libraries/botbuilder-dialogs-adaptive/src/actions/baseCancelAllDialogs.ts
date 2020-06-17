/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, Dialog, TurnPath, DialogEvents } from 'botbuilder-dialogs';
import { StringExpression, BoolExpression, ValueExpression } from 'adaptive-expressions';


export class BaseCancelAllDialogs<O extends object = {}> extends Dialog<O> {
    public constructor();
    public constructor(eventName: string, eventValue?: string, isCancelAll?: boolean);
    public constructor(eventName?: string, eventValue?: string, isCancelAll = false) {
        super();
        if (eventName) {
            this.eventName = new StringExpression(eventName);
        }
        if (eventValue) {
            this.eventValue = new StringExpression(eventValue);
        }
        this.cancelAll = isCancelAll;

    }

    /**
     * Expression for event name.
     */
    public eventName: StringExpression;

    /**
     * Expression for event value.
     */
    public eventValue: ValueExpression;

    public disabled: BoolExpression;

    public activityProcessed: BoolExpression;

    public cancelAll: boolean;

    public async beginDialog(dc: DialogContext, options: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        var eventName = this.eventName && this.eventName.getValue(dc.state);
        var eventValue = this.eventValue && this.eventValue.getValue(dc.state);

        if (this.activityProcessed  && this.activityProcessed.getValue(dc.state) == false ) {
            // mark that this hasn't been recognized
            dc.state.setValue(TurnPath.activityProcessed, false);
            eventName = DialogEvents.activityReceived;
            eventValue = dc.context.activity;

        }
        if (!dc.parent) {
            return await dc.cancelAllDialogs(this.cancelAll, eventName, eventValue);
        } else {
            const turnResult = await dc.cancelAllDialogs(this.cancelAll, eventName, eventValue);
            turnResult.parentEnded = true;
            return turnResult;
        }
    }

    protected onComputeId(): string {
        return `${ this.constructor.name }[${ this.eventName ? this.eventName.toString() : '' }]`;
    }
}