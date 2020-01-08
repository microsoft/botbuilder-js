/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, Dialog, Configurable } from 'botbuilder-dialogs';
import { Activity, ActivityTypes } from 'botbuilder-core';
import { Expression, ExpressionEngine } from 'botframework-expressions';
import { format } from '../stringTemplate';

export interface LogActionConfiguration extends DialogConfiguration {
    /**
     * The text template to log.
     */
    text?: string;

    /**
     * If true, the message will both be logged to the console and sent as a trace activity.
     * Defaults to a value of false.
     */
    traceActivity?: boolean;

    disabled?: string;
}

export class LogAction<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.LogAction';

    /**
     * Creates a new `SendActivity` instance.
     * @param template The text template to log.
     * @param sendTrace (Optional) If true, the message will both be logged to the console and sent as a trace activity.  Defaults to a value of false.
     */
    public constructor();
    public constructor(text: string, traceActivity?: boolean);
    public constructor(text?: string, traceActivity = false) {
        super();
        if (text) { this.text = text; }
        this.traceActivity = traceActivity;
    }

    /**
     * The text template to log.
     */
    public text: string;

    /**
     * If true, the message will both be logged to the console and sent as a trace activity.
     * Defaults to a value of false.
     */
    public traceActivity: boolean = false;

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

    private _disabled: Expression;

    public configure(config: LogActionConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this._disabled) {
            const { value } = this._disabled.tryEvaluate(dc.state);
            if (!!value) {
                return await dc.endDialog();
            }
        }

        if (!this.text) { throw new Error(`${ this.id }: no 'message' specified.`) }

        const msg = format(this.text, dc);

        // Log to console and send trace if needed
        console.log(msg);
        if (this.traceActivity) {
            const activity: Partial<Activity> = {
                type: ActivityTypes.Trace,
                name: 'LogAction',
                valueType: 'string',
                value: msg
            };
            await dc.context.sendActivity(activity);
        }

        return await dc.endDialog();
    }

    protected onComputeId(): string {
        return `LogAction[${ this.text }]`;
    }
}