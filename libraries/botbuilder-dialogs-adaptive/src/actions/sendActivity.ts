/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ActivityTypes, ResourceResponse, StringUtils } from 'botbuilder';
import { ActivityTemplate, StaticActivityTemplate } from '../templates';
import { ActivityTemplateConverter } from '../converters';
import { BoolExpression, BoolExpressionConverter } from 'adaptive-expressions';
import { BoolProperty, TemplateInterfaceProperty } from '../properties';
import { TelemetryLoggerConstants } from '../telemetryLoggerConstants';

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

export interface SendActivityConfiguration extends DialogConfiguration {
    activity?: TemplateInterfaceProperty<Partial<Activity>, D>;
    disabled?: BoolProperty;
}

/**
 * Send an activity back to the user.
 */
export class SendActivity<O extends object = {}> extends Dialog<O> implements SendActivityConfiguration {
    static $kind = 'Microsoft.SendActivity';

    /**
     * Creates a new [SendActivity](xref:botbuilder-dialogs-adaptive.SendActivity) instance.
     *
     * @param activity [Activity](xref:botframework-schema.Activity) or message text to send the user.
     */
    constructor(activity?: Partial<Activity> | string) {
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
    activity: TemplateInterface<Partial<Activity>, D & O>;

    /**
     * An optional expression which if is true will disable this action.
     */
    disabled?: BoolExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof SendActivityConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'activity':
                return new ActivityTemplateConverter();
            case 'disabled':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * Starts a new [Dialog](xref:botbuilder-dialogs.Dialog) and pushes it onto the dialog stack.
     *
     * @param dc The `DialogContext` for the current turn of conversation.
     * @param options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, options: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (!this.activity) {
            // throw new Error(`SendActivity: no activity assigned for action '${this.id}'.`)
            throw new Error('SendActivity: no activity assigned for action.');
        }

        // Send activity and return result
        const data = Object.assign(
            dc.state,
            {
                utterance: dc.context.activity.text || '',
            },
            options
        );

        const activityResult = await this.activity.bind(dc, data);

        this.telemetryClient.trackEvent({
            name: TelemetryLoggerConstants.GeneratorResultEvent,
            properties: {
                template: this.activity,
                result: activityResult || '',
                context: TelemetryLoggerConstants.SendActivityResultEvent,
            },
        });

        let result: ResourceResponse;
        if (
            activityResult.type !== ActivityTypes.Message ||
            activityResult.text ||
            activityResult.speak ||
            (activityResult.attachments && activityResult.attachments.length > 0) ||
            activityResult.suggestedActions ||
            activityResult.channelData
        ) {
            result = await dc.context.sendActivity(activityResult);
        }

        return await dc.endDialog(result);
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        if (this.activity instanceof ActivityTemplate) {
            return `SendActivity[${StringUtils.ellipsis(this.activity.template.trim(), 30)}]`;
        }
        return `SendActivity[${StringUtils.ellipsis(this.activity && this.activity.toString().trim(), 30)}]`;
    }
}
