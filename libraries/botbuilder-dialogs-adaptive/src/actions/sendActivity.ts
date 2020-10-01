/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, Dialog } from 'botbuilder-dialogs';
import { Activity, StringUtils, MessageFactory, ActivityTypes, ResourceResponse } from 'botbuilder-core';
import { TemplateInterface } from '../template';
import { ActivityTemplate } from '../templates/activityTemplate';
import { StaticActivityTemplate } from '../templates/staticActivityTemplate';
import { BoolExpression } from 'adaptive-expressions';

/**
 * Send an activity back to the user.
 */
export class SendActivity<O extends object = {}> extends Dialog<O> {
    /**
     * Creates a new `SendActivity` instance.
     * @param activity Activity or message text to send the user.
     */
    public constructor(activity?: Partial<Activity> | string) {
        super();
        if (activity) { 
            if (typeof activity === 'string') { 
                this.activity = new ActivityTemplate(activity); 
            } else {
                this.activity = new StaticActivityTemplate(activity); 
            }
        }
    }

    /**
     * Gets or sets template for the activity.
     */
    public activity: TemplateInterface<Partial<Activity>>;
    
    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    /**
     * Starts a new dialog and pushes it onto the dialog stack.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param options Optional, initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options: O): Promise<DialogTurnResult> {

        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (!this.activity) {
            // throw new Error(`SendActivity: no activity assigned for action '${this.id}'.`)
            throw new Error(`SendActivity: no activity assigned for action.`);
        }

        // Send activity and return result
        const data = Object.assign(dc.state, {
            utterance: dc.context.activity.text || ''
        }, options);
        
        const activityResult = await this.activity.bind(dc, data);

        this.telemetryClient.trackEvent({
            name: 'GeneratorResult',
            properties: {
                'template':this.activity,
                'result': activityResult || ''
            }
        });

        let result: ResourceResponse;
        if (activityResult.type !== ActivityTypes.Message
             || activityResult.text
             || activityResult.speak
             || (activityResult.attachments && activityResult.attachments.length > 0)
             || activityResult.suggestedActions
             || activityResult.channelData) {
            result = await dc.context.sendActivity(activityResult);
        }

        return await dc.endDialog(result);
    }

    /**
     * @protected
     * Builds the compute Id for the dialog.
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        if (this.activity instanceof ActivityTemplate) {
            return `SendActivity[${ StringUtils.ellipsis(this.activity.template.trim(), 30) }]`;
        }
        return `SendActivity[${ StringUtils.ellipsis(this.activity && this.activity.toString().trim(), 30) }]`;
    }
}
