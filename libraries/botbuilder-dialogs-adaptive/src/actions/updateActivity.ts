/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Configurable, Dialog, DialogContext, DialogTurnResult, DialogConfiguration } from 'botbuilder-dialogs';
import { Activity } from 'botbuilder-core';
import { TemplateInterface } from '../template';
import { StringExpression, BoolExpression } from '../expressionProperties';
import { ActivityTemplate, StaticActivityTemplate } from '../templates';

export interface UpdateActivityConfiguration extends DialogConfiguration {
    activity?: string;
    activityId?: string;
    disabled?: string | boolean;
}

export class UpdateActivity<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.UpdateActivity';

    public constructor();
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

    public configure(config: UpdateActivityConfiguration): this {
        for (const key in config) {
            if (config.hasOwnProperty(key)) {
                const value = config[key];
                switch (key) {
                    case 'activity':
                        this.activity = new ActivityTemplate(value);
                        break;
                    case 'activityId':
                        this.activityId = new StringExpression(value);
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

        if (!this.activity) {
            throw new Error(`UpdateActivity: no activity assigned for action.`);
        }

        const data = Object.assign({
            utterance: dc.context.activity.text || ''
        }, dc.state, options);
        const activityResult = await this.activity.bindToData(dc.context, data);

        const value = this.activityId.getValue(dc.state);
        activityResult.id = value.toString();

        const result = await dc.context.updateActivity(activityResult);
        return await dc.endDialog(result);
    }

    protected onComputeId(): string {
        return `UpdateActivity[${ this.activity }]`;
    }
}