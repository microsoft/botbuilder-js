/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Dialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { Activity, StringUtils } from 'botbuilder-core';
import { TemplateInterface } from '../template';
import { StringExpression, BoolExpression } from 'adaptive-expressions';
import { ActivityTemplate, StaticActivityTemplate } from '../templates';

/**
 * Update an activity with replacement.
 */
export class UpdateActivity<O extends object = {}> extends Dialog<O> {
    public constructor();

    /**
     * Initializes a new instance of the UpdateActivity class.
     * @param activityId Optional. The expression which resolves to the activityId to update.
     * @param activity Optional. Template for the activity.
     */
    public constructor(activityId?: string, activity?: Partial<Activity> | string) {
        super();
        if (activityId) {
            this.activityId = new StringExpression(activityId);
        }
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
     * The expression which resolves to the activityId to update.
     */
    public activityId: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    /**
     * Starts a new dialog and pushes it onto the dialog stack.
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (!this.activity) {
            throw new Error(`UpdateActivity: no activity assigned for action.`);
        }

        const data = Object.assign({
            utterance: dc.context.activity.text || ''
        }, dc.state, options);
        const activityResult = await this.activity.bind(dc, data);

        this.telemetryClient.trackEvent({
            name: 'GeneratorResult',
            properties: {
                'template':this.activity,
                'result': activityResult || ''
            }
        });

        const value = this.activityId.getValue(dc.state);
        activityResult.id = value.toString();

        const result = await dc.context.updateActivity(activityResult);
        return await dc.endDialog(result);
    }

    /**
     * @protected
     * Builds the compute Id for the dialog.
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        if (this.activity instanceof ActivityTemplate) {
            return `UpdateActivity[${ StringUtils.ellipsis(this.activity.template.trim(), 30) }]`;
        }
        return `UpdateActivity[${ StringUtils.ellipsis(this.activity && this.activity.toString().trim(), 30) }]`;
    }
}
