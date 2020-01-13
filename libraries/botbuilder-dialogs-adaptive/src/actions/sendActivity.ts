/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, Dialog, Configurable } from 'botbuilder-dialogs';
import { Activity, InputHints } from 'botbuilder-core';
import { Expression, ExpressionEngine } from 'botframework-expressions';
import { TemplateInterface } from '../template';
import { ActivityTemplate } from '../templates/activityTemplate';
import { StaticActivityTemplate } from '../templates/staticActivityTemplate';
import { TextTemplate } from '../templates';

export interface SendActivityConfiguration extends DialogConfiguration {
    /**
     * Activity or message text to send the user.
     */
    activity?: TemplateInterface<Partial<Activity>>;

    /**
     * (Optional) Structured Speech Markup Language (SSML) to speak to the user.
     */
    speak?: string;

    /**
     * (Optional) input hint for the message. Defaults to a value of `InputHints.acceptingInput`.
     */
    inputHint?: InputHints;

    disabled?: string;
}

export class SendActivity<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.SendActivity';

    /**
     * Creates a new `SendActivity` instance.
     * @param activity Activity or message text to send the user.
     */
    public constructor();
    public constructor(activity?: Partial<Activity> | string) {
        super();
        if (activity) { 
            if (typeof activity === 'string') { 
                this.activity = new ActivityTemplate(activity); 
            } else {
                this.activity = new StaticActivityTemplate(activity as Activity); 
            }
        }
    }

    /**
     * Gets or sets template for the activity.
     */
    public activity: TemplateInterface<Partial<Activity>>;
    
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

    /**
     * (Optional) in-memory state property that the result of the send should be saved to.
     *
     * @remarks
     * This is just a convenience property for setting the dialogs [outputBinding](#outputbinding).
     */
    public configure(config: SendActivityConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options: O): Promise<DialogTurnResult> {

        if (this._disabled) {
            const { value } = this._disabled.tryEvaluate(dc.state);
            if (!!value) {
                return await dc.endDialog();
            }
        }

        if (!this.activity) {
            // throw new Error(`SendActivity: no activity assigned for action '${this.id}'.`)
            throw new Error(`SendActivity: no activity assigned for action.`)
        }

        // Send activity and return result
        const data = Object.assign({
            utterance: dc.context.activity.text || ''
        }, dc.state, options);
        const activityResult = await this.activity.bindToData(dc.context, data);
        const result = await dc.context.sendActivity(activityResult);
        return await dc.endDialog(result);
    }

    protected onComputeId(): string {
        return `SendActivity[${ this.activity }]`;
    }
}