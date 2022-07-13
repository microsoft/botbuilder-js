/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, StringUtils } from 'botbuilder';
import { ActivityTemplate, StaticActivityTemplate } from '../templates';
import { ActivityTemplateConverter } from '../converters';
import { BoolProperty, StringProperty, TemplateInterfaceProperty } from '../properties';
import { TelemetryLoggerConstants } from '../telemetryLoggerConstants';

import {
    StringExpression,
    BoolExpression,
    BoolExpressionConverter,
    StringExpressionConverter,
} from 'adaptive-expressions';

import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogStateManager,
    DialogTurnResult,
    TemplateInterface,
} from 'botbuilder-dialogs';

type D = DialogStateManager & {
    utterance: string;
};

export interface UpdateActivityConfiguration extends DialogConfiguration {
    activity?: TemplateInterfaceProperty<Partial<Activity>, D>;
    activityId?: StringProperty;
    disabled?: BoolProperty;
}

/**
 * Update an activity with replacement.
 */
export class UpdateActivity<O extends object = {}> extends Dialog<O> implements UpdateActivityConfiguration {
    static $kind = 'Microsoft.UpdateActivity';

    constructor();

    /**
     * Initializes a new instance of the [UpdateActivity](xref:botbuilder-dialogs-adaptive.UpdateActivity) class.
     *
     * @param activityId Optional. The expression which resolves to the activityId to update.
     * @param activity Optional. Template for the [Activity](xref:botframework-schema.Activity).
     */
    constructor(activityId?: string, activity?: Partial<Activity> | string) {
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
    activity: TemplateInterface<Partial<Activity>, D & O>;

    /**
     * The expression which resolves to the activityId to update.
     */
    activityId: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    disabled?: BoolExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof UpdateActivityConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'activity':
                return new ActivityTemplateConverter();
            case 'activityId':
                return new StringExpressionConverter();
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
     *
     * @param dc The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (!this.activity) {
            throw new Error('UpdateActivity: no activity assigned for action.');
        }

        const data = Object.assign(
            {
                utterance: dc.context.activity.text || '',
            },
            dc.state,
            options
        );
        const activityResult = await this.activity.bind(dc, data);

        this.telemetryClient.trackEvent({
            name: TelemetryLoggerConstants.GeneratorResultEvent,
            properties: {
                template: this.activity,
                result: activityResult || '',
                context: TelemetryLoggerConstants.UpdateActivityResultEvent,
            },
        });

        const value = this.activityId.getValue(dc.state);
        activityResult.id = value.toString();

        const result = await dc.context.updateActivity(activityResult);
        return await dc.endDialog(result);
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        if (this.activity instanceof ActivityTemplate) {
            return `UpdateActivity[${StringUtils.ellipsis(this.activity.template.trim(), 30)}]`;
        }
        return `UpdateActivity[${StringUtils.ellipsis(this.activity && this.activity.toString().trim(), 30)}]`;
    }
}
