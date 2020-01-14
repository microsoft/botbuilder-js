/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Configurable, Dialog, DialogContext, DialogTurnResult, DialogConfiguration } from 'botbuilder-dialogs';
import { Expression, ExpressionEngine } from 'botframework-expressions';
import { Activity } from 'botbuilder-core';
import { TemplateInterface } from '../template';
import { ActivityTemplate } from '../templates/activityTemplate';
import { StaticActivityTemplate } from '../templates/staticActivityTemplate';

export interface UpdateActivityConfiguration extends DialogConfiguration {
    activityId?: string;
    activity?: TemplateInterface<Partial<Activity>>;
    disabled?: string;
}

export class UpdateActivity<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.UpdateActivity';

    public constructor();
    public constructor(activityId?: string, activity?: Partial<Activity> | string) {
        super();
        if (activityId) { this.activityId = activityId; }
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
     * Get the expression which resolves to the activityId to update.
     */
    public get activityId(): string {
        return this._activityId ? this._activityId.toString() : undefined;
    }

    /**
     * Set the expression which resolves to the activityId to update.
     */
    public set activityId(value: string) {
        this._activityId = value ? new ExpressionEngine().parse(value) : undefined;
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

    private _activityId: Expression;

    private _disabled: Expression;


    public configure(config: UpdateActivityConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this._disabled) {
            const { value } = this._disabled.tryEvaluate(dc.state);
            if (!!value) {
                return await dc.endDialog();
            }
        }

        if (!this.activity) {
            throw new Error(`UpdateActivity: no activity assigned for action.`);
        }

        const data = Object.assign({
            utterance: dc.context.activity.text || ''
        }, dc.state, options);
        const activityResult = await this.activity.bindToData(dc.context, data);

        const { value, error } = this._activityId.tryEvaluate(dc.state);
        if (error) {
            throw new Error(error);
        }
        activityResult.id = value.toString();

        const result = await dc.context.updateActivity(activityResult);
        return await dc.endDialog(result);
    }

    protected onComputeId(): string {
        return `UpdateActivity[${ this.activity }]`;
    }
}