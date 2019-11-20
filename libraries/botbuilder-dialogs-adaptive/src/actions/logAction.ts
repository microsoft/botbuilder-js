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
    template?: string;

    /**
     * If true, the message will both be logged to the console and sent as a trace activity.
     * Defaults to a value of false.
     */
    sendTrace?: boolean;
}

export class LogAction extends Dialog {
    /**
     * The text template to log.
     */
    public template: string;

    /**
     * If true, the message will both be logged to the console and sent as a trace activity.
     * Defaults to a value of false.
     */
    public sendTrace: boolean;

    /**
     * Creates a new `SendActivity` instance.
     * @param template The text template to log.
     * @param sendTrace (Optional) If true, the message will both be logged to the console and sent as a trace activity.  Defaults to a value of false.
     */
    constructor();
    constructor(template: string, sendTrace?: boolean);
    constructor(template?: string, sendTrace = false) {
        super();
        if (template) { this.template = template }
        this.sendTrace = sendTrace;
    }

    protected onComputeId(): string {
        return `LogAction[${this.template}]`;
    }

    public configure(config: LogActionConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options: object): Promise<DialogTurnResult> {
        if (!this.template) { throw new Error(`${this.id}: no 'message' specified.`) }

        // Format message
        const data = Object.assign({
            utterance: dc.context.activity.text || ''
        }, dc.state, options);
        const msg = format(this.template, dc);

        // Log to console and send trace if needed
        console.log(msg);
        if (this.sendTrace) {
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
}