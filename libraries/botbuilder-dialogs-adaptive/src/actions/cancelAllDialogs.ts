/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, Dialog } from 'botbuilder-dialogs';
import { StringExpression, BoolExpression } from 'adaptive-expressions';

export class CancelAllDialogs<O extends object = {}> extends Dialog<O> {
    public constructor();
    public constructor(eventName: string, eventValue?: string);
    public constructor(eventName?: string, eventValue?: string) {
        super();
        this.eventName = new StringExpression(eventName);
        this.eventValue = new StringExpression(eventValue);
    }

    /**
     * Expression for event name.
     */
    public eventName: StringExpression;

    /**
     * Expression for event value.
     */
    public eventValue: StringExpression;

    public disabled: BoolExpression;

    public async beginDialog(dc: DialogContext, options: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (!dc.parent) {
            return await dc.cancelAllDialogs(true, this.eventName && this.eventName.getValue(dc.state), this.eventValue && this.eventValue.getValue(dc.state));
        } else {
            const turnResult = await dc.cancelAllDialogs(true, this.eventName && this.eventName.getValue(dc.state), this.eventValue && this.eventValue.getValue(dc.state));
            turnResult.parentEnded = true;
            return turnResult;
        }
    }

    protected onComputeId(): string {
        return `CancelAllDialogs[${ this.eventName ? this.eventName.toString() : '' }]`;
    }
}