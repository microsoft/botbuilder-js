/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, DialogConfiguration, Dialog, Configurable } from 'botbuilder-dialogs';
import { ValueExpression, StringExpression, BoolExpression } from '../expressionProperties';

export interface EmitEventConfiguration extends DialogConfiguration {
    eventName?: string;
    eventValue?: any;
    bubbleEvent?: string | boolean;
    disabled?: string | boolean;
}

export class EmitEvent<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.EmitEvent';

    public constructor();
    public constructor(eventName: string, eventValue?: any, bubbleEvent?: boolean);
    public constructor(eventName?: string, eventValue?: any, bubbleEvent = true) {
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

    public configure(config: EmitEventConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'eventName':
                        this.eventName = new StringExpression(value);
                        break;
                    case 'eventValue':
                        this.eventValue = new ValueExpression(value);
                        break;
                    case 'bubbleEvent':
                        this.bubbleEvent = new BoolExpression(value);
                        break;
                    case 'disabled':
                        this.disabled = new BoolExpression(value);
                        break;
                    default:
                        super.configure({ [key]: value });
                        break;
                }
            }
        }

        return this;
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        let handled = false;

        if (this.eventValue) {
            const value = this.eventValue.getValue(dc.state);
            handled = await dc.emitEvent(this.eventName.getValue(dc.state), value, this.bubbleEvent.getValue(dc.state), false);
        } else {
            handled = await dc.emitEvent(this.eventName.getValue(dc.state), this.eventValue, this.bubbleEvent.getValue(dc.state), false);
        }

        return await dc.endDialog(handled);
    }

    protected onComputeId(): string {
        return `EmitEvent[${ this.eventName.toString() || '' }]`;
    }
}