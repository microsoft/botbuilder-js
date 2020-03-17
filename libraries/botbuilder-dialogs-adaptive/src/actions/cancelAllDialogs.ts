/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, DialogConfiguration, Dialog, Configurable } from 'botbuilder-dialogs';
import { StringExpression, BoolExpression } from '../expressionProperties';

export interface CancelAllDialogsConfiguration extends DialogConfiguration {
    eventName?: string;
    eventValue?: string;
    disabled?: string | boolean;
}

export class CancelAllDialogs<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.CancelAllDialogs';

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

    public configure(config: CancelAllDialogsConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'eventName':
                        this.eventName = new StringExpression(value);
                        break;
                    case 'eventValue':
                        this.eventValue = new StringExpression(value);
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

    public async beginDialog(dc: DialogContext, options: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (!dc.parent) {
            return await dc.cancelAllDialogs(true, this.eventName.getValue(dc.state), this.eventValue.getValue(dc.state));
        } else {
            const turnResult = await dc.cancelAllDialogs(true, this.eventName.getValue(dc.state), this.eventValue.getValue(dc.state));
            turnResult.parentEnded = true;
            return turnResult;
        }
    }

    protected onComputeId(): string {
        return `CancelAllDialogs[${ this.eventName.toString() || '' }]`;
    }
}