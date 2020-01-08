/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, DialogConfiguration, Dialog, Configurable } from 'botbuilder-dialogs';
import { ExpressionEngine, Expression } from 'botframework-expressions';

export interface CancelAllDialogsConfiguration extends DialogConfiguration {
    eventName?: string;
    eventValue?: string;
    disabled?: string;
}

export class CancelAllDialogs<O extends object = {}> extends Dialog<O> implements Configurable {
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
     * Get value expression for event value.
     */
    public get eventValue(): string {
        return this._eventValueExpression ? this._eventValueExpression.toString() : undefined;
    }

    /**
     * Set value expression for event value.
     */
    public set eventValue(value: string) {
        this._eventValueExpression = value ? new ExpressionEngine().parse(value) : undefined;
    }

    /**
     * Get an optional expression which if is true will disable this action.
     */
    public get disabled(): string {
        return this._disabled ? this._disabled.toString() : undefined;
    }

    /**
     * Set an optional expression which if is true will disable this action.
     */
    public set disabled(value: string) {
        this._disabled = value ? new ExpressionEngine().parse(value) : undefined;
    }

    private _eventValueExpression: Expression;

    private _disabled: Expression;

    public configure(config: CancelAllDialogsConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options: O): Promise<DialogTurnResult> {
        if (this._disabled) {
            const { value } = this._disabled.tryEvaluate(dc.state);
            if (!!value) {
                return await dc.endDialog();
            }
        }

        let eventValue: any;
        if (this._eventValueExpression) {
            const { value } = this._eventValueExpression.tryEvaluate(dc.state);
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