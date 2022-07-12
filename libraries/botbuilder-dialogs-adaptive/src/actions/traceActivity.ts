/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, ActivityTypes } from 'botbuilder';
import { BoolProperty, StringProperty, UnknownProperty } from '../properties';

import {
    BoolExpression,
    BoolExpressionConverter,
    StringExpression,
    StringExpressionConverter,
    ValueExpression,
    ValueExpressionConverter,
} from 'adaptive-expressions';

import {
    Converter,
    ConverterFactory,
    Dialog,
    DialogConfiguration,
    DialogContext,
    DialogTurnResult,
} from 'botbuilder-dialogs';

export interface TraceActivityConfiguration extends DialogConfiguration {
    name?: StringProperty;
    valueType?: StringProperty;
    value?: UnknownProperty;
    label?: StringProperty;
    disabled?: BoolProperty;
}

/**
 * Send an trace activity back to the transcript.
 */
export class TraceActivity<O extends object = {}> extends Dialog<O> implements TraceActivityConfiguration {
    static $kind = 'Microsoft.TraceActivity';

    constructor();

    /**
     * Initializes a new instance of the [TraceActivity](xref:botbuilder-dialogs-adaptive.TraceActivity) class.
     *
     * @param name Name of the trace activity.
     * @param valueType Value type of the trace activity.
     * @param value Value expression to send as the value.
     * @param label Label to use when describing a trace activity.
     */
    constructor(name: string, valueType: string, value: any, label: string);

    /**
     * Initializes a new instance of the [TraceActivity](xref:botbuilder-dialogs-adaptive.TraceActivity) class.
     *
     * @param name Optional. Name of the trace activity.
     * @param valueType Optional. Value type of the trace activity.
     * @param value Optional. Value expression to send as the value.
     * @param label Optional. Label to use when describing a trace activity.
     */
    constructor(name?: string, valueType?: string, value?: any, label?: string) {
        super();
        if (name) {
            this.name = new StringExpression(name);
        }
        if (valueType) {
            this.valueType = new StringExpression(valueType);
        }
        if (value) {
            this.value = new ValueExpression(value);
        }
        if (label) {
            this.label = new StringExpression(label);
        }
    }

    /**
     * Gets or sets name of the trace activity.
     */
    name?: StringExpression;

    /**
     * Gets or sets value type of the trace activity.
     */
    valueType?: StringExpression;

    /**
     * Gets or sets value expression to send as the value.
     */
    value?: ValueExpression;

    /**
     * Gets or sets a label to use when describing a trace activity.
     */
    label?: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    disabled?: BoolExpression;

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof TraceActivityConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'name':
                return new StringExpressionConverter();
            case 'valueType':
                return new StringExpressionConverter();
            case 'value':
                return new ValueExpressionConverter();
            case 'label':
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
     * @param _options Optional. Initial information to pass to the dialog.
     * @returns A `Promise` representing the asynchronous operation.
     */
    async beginDialog(dc: DialogContext, _options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        let value: any;

        if (this.value) {
            value = this.value.getValue(dc.state);
        } else {
            value = dc.state.getMemorySnapshot();
        }

        const name = (this.name && this.name.getValue(dc.state)) || 'Trace';
        const valueType = (this.valueType && this.valueType.getValue(dc.state)) || 'State';
        const label =
            (this.label && this.label.getValue(dc.state)) ||
            (dc.parent && dc.parent.activeDialog && dc.parent.activeDialog.id) ||
            '';

        const traceActivity: Partial<Activity> = {
            type: ActivityTypes.Trace,
            timestamp: new Date(),
            name,
            value,
            valueType,
            label,
        };
        await dc.context.sendActivity(traceActivity);
        return await dc.endDialog(traceActivity);
    }

    /**
     * @protected
     * Builds the compute Id for the [Dialog](xref:botbuilder-dialogs.Dialog).
     * @returns A `string` representing the compute Id.
     */
    protected onComputeId(): string {
        return `TraceActivity[${this.name ? this.name.toString() : ''}]`;
    }
}
