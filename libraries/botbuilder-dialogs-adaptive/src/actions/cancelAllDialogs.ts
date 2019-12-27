/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, DialogConfiguration, Dialog } from 'botbuilder-dialogs';
import { ExpressionEngine } from 'botframework-expressions';

export interface CancelAllDialogsConfiguration extends DialogConfiguration {
    eventName?: string;
    eventValue?: string;
}

export class CancelAllDialogs<O extends object = {}> extends Dialog<O> {

    public static declarativeType = 'Microsoft.CancelAllDialogs';

    public constructor();
    public constructor(eventName: string, eventValue?: string);
    public constructor(eventName?: string, eventValue?: string) {
        super();
        this.eventName = eventName;
        this.eventValue = eventValue;
    }

    /**
     * Event name.
     */
    public eventName: string;

    /**
     * Value expression for event value.
     */
    public eventValue: string;

    public configure(config: CancelAllDialogsConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options: O): Promise<DialogTurnResult> {
        let eventValue: any;
        if (this.eventValue) {
            const eventValueExpression = new ExpressionEngine().parse(this.eventValue);
            const { value } = eventValueExpression.tryEvaluate(dc.state);
            eventValue = value;
        }

        if (!dc.parent) {
            return await dc.cancelAllDialogs(true, this.eventName, eventValue);
        } else {
            const turnResult = await dc.cancelAllDialogs(true, this.eventName, eventValue);
            turnResult.parentEnded = true;
            return turnResult;
        }
    }

    protected onComputeId(): string {
        return `CancelAllDialogs[${ this.eventName || '' }]`;
    }
}