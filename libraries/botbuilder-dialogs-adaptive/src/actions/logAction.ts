/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, Dialog, Configurable } from 'botbuilder-dialogs';
import { Activity, ActivityTypes } from 'botbuilder-core';
import { TemplateInterface } from '../template';
import { TextTemplate } from '../templates';
import { StringExpression, BoolExpression } from '../expressionProperties';

export interface LogActionConfiguration extends DialogConfiguration {
    text?: string;
    traceActivity?: string | boolean;
    label?: string;
    disabled?: string | boolean;
}

export class LogAction<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.LogAction';

    /**
     * Creates a new `SendActivity` instance.
     * @param template The text template to log.
     * @param sendTrace (Optional) If true, the message will both be logged to the console and sent as a trace activity.  Defaults to a value of false.
     */
    public constructor();
    public constructor(text: string);
    public constructor(text?: string) {
        super();
        if (text) { this.text = new TextTemplate(text); }
    }

    /**
     * The text template to log.
     */
    public text: TemplateInterface<string>;

    /**
     * If true, the message will both be logged to the console and sent as a trace activity.
     * Defaults to a value of false.
     */
    public traceActivity: BoolExpression = new BoolExpression(false);

    /**
     * A label to use when describing a trace activity.
     */
    public label: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public configure(config: LogActionConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'text':
                        this.text = new TextTemplate(value);
                        break;
                    case 'traceActivity':
                        this.traceActivity = new BoolExpression(value);
                        break;
                    case 'label':
                        this.label = new StringExpression(value);
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

        if (!this.text) { throw new Error(`${ this.id }: no 'message' specified.`) }

        const msg = await this.text.bindToData(dc.context, dc.state);

        // Log to console and send trace if needed
        console.log(msg);
        let label = '';
        if (this.label) {
            label = this.label.getValue(dc.state);
        } else {
            if (dc.parent && dc.parent.activeDialog && dc.parent.activeDialog.id)  {
                label = dc.parent.activeDialog.id;
            }
        }
        if (this.traceActivity && this.traceActivity.getValue(dc.state)) {
            const activity: Partial<Activity> = {
                type: ActivityTypes.Trace,
                name: 'LogAction',
                valueType: 'string',
                value: msg,
                label: label
            };
            await dc.context.sendActivity(activity);
        }

        return await dc.endDialog();
    }

    protected onComputeId(): string {
        return `LogAction[${ this.text }]`;
    }
}