/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, Dialog } from 'botbuilder-dialogs';
import { format } from '../stringTemplate';
import { Activity, ActivityTypes } from 'botbuilder-core';

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
}

export class LogAction<O extends object = {}> extends Dialog<O> {

    public static declarativeType = 'Microsoft.LogAction';

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

    public configure(config: LogActionConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
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