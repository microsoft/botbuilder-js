/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, DialogConfiguration, Dialog } from 'botbuilder-dialogs';
import { Expression, ExpressionEngine } from 'botframework-expressions';

export interface EmitEventConfiguration extends DialogConfiguration {
    eventName?: string;
    eventValue?: string;
    bubbleEvent?: boolean;
    resultProperty?: string;
}

export class EmitEvent<O extends object = {}> extends Dialog<O> {

    public static declarativeType = 'Microsoft.EmitEvent';

    private _eventValue: Expression;

    public constructor();
    public constructor(eventName: string, eventValue?: string, bubbleEvent?: boolean);
    public constructor(eventName?: string, eventValue?: string, bubbleEvent = true) {
        super();
        this.eventName = eventName;
        this.eventValue = eventValue;
        this.bubbleEvent = bubbleEvent;
    }

    /**
     * The name of the event to emit.
     */
    public eventName: string;

    /**
     * Get the memory property path to use to get the value to send as part of the event.
     */
    public get eventValue(): string {
        return this._eventValue ? this._eventValue.toString() : undefined;
    }

    /**
     * Set the memory property path to use to get the value to send as part of the event.
     */
    public set eventValue(value: string) {
        this._eventValue = value ? new ExpressionEngine().parse(value) : undefined;
    }

    /**
     * A value indicating whether gets or sets whether the event should bubble or not.
     */
    public bubbleEvent: boolean;

    public configure(config: EmitEventConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        let handled = false;

        if (this.eventValue) {
            const { value, error } = this._eventValue.tryEvaluate(dc.state);
            if (error) {
                throw new Error(`Expression evaluation resulted in an error. Expression: ${ this.eventValue }. Error: ${ error }`);
            }
            handled = await dc.emitEvent(this.eventName, value, this.bubbleEvent, false);
        } else {
            handled = await dc.emitEvent(this.eventName, this.eventValue, this.bubbleEvent, false);
        }

        return await dc.endDialog(handled);
    }

    protected onComputeId(): string {
        return `EmitEvent[${ this.eventName || '' }]`;
    }
}