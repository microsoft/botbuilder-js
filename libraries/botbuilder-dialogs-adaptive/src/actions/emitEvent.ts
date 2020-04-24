/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, Dialog } from 'botbuilder-dialogs';
import { ValueExpression, StringExpression, BoolExpression } from 'adaptive-expressions';

export class EmitEvent<O extends object = {}> extends Dialog<O> {
    public constructor();
    public constructor(eventName: string, eventValue?: string, bubbleEvent?: boolean);
    public constructor(eventName?: string, eventValue?: string, bubbleEvent = false) {
        super();
        if (eventName) { this.eventName = new StringExpression(eventName); }
        if (eventValue) { this.eventValue = new ValueExpression(eventValue); }
        this.bubbleEvent = new BoolExpression(bubbleEvent);
    }

    /**
     * The name of the event to emit.
     */
    public eventName: StringExpression;

    /**
     * The memory property path to use to get the value to send as part of the event.
     */
    public eventValue: ValueExpression;

    /**
     * A value indicating whether gets or sets whether the event should bubble or not.
     */
    public bubbleEvent: BoolExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        let eventName: string;
        if (this.eventName) {
            eventName = this.eventName.getValue(dc.state);
        }
    
        let eventValue: any;
        if (this.eventValue) {
            eventValue = this.eventValue.getValue(dc.state);
        }

        let bubbleEvent = false;
        if (this.bubbleEvent) {
            bubbleEvent = this.bubbleEvent.getValue(dc.state);
        }

        let handled = false;
        if (dc.parent) {
            handled = await dc.parent.emitEvent(eventName, eventValue, bubbleEvent, false);
        } else {
            handled = await dc.emitEvent(eventName, eventValue, bubbleEvent, false);
        }

        return await dc.endDialog(handled);
    }

    protected onComputeId(): string {
        return `EmitEvent[${ this.eventName.toString() || '' }]`;
    }
}