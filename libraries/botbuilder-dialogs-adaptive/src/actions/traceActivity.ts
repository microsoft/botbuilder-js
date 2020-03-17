/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogContext, Dialog } from 'botbuilder-dialogs';
import { Activity, ActivityTypes } from 'botbuilder-core';
import { ValueExpression, StringExpression, BoolExpression } from '../expressionProperties';

export class TraceActivity<O extends object = {}> extends Dialog<O> {
    public constructor();
    public constructor(name: string, valueType: string, value: any, label: string);
    public constructor(name?: string, valueType?: string, value?: any, label?: string) {
        super();
        if (name) { this.name = new StringExpression(name); }
        if (valueType) { this.valueType = new StringExpression(valueType); }
        if (value) { this.value = new ValueExpression(value); }
        if (label) { this.label = new StringExpression(label); }
    }

    /**
     * Gets or sets name of the trace activity.
     */
    public name?: StringExpression;

    /**
     * Gets or sets value type of the trace activity.
     */
    public valueType?: StringExpression;

    /**
     * Gets or sets value expression to send as the value.
     */
    public value?: ValueExpression;

    /**
     * Gets or sets a label to use when describing a trace activity.
     */
    public label?: StringExpression;

    /**
     * An optional expression which if is true will disable this action.
     */
    public disabled?: BoolExpression;

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
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
        const label = (this.label && this.label.getValue(dc.state)) || (dc.parent && dc.parent.activeDialog && dc.parent.activeDialog.id) || '';

        const traceActivity: Partial<Activity> = {
            type: ActivityTypes.Trace,
            timestamp: new Date(),
            name,
            value,
            valueType,
            label
        };
        await dc.context.sendActivity(traceActivity);
        return await dc.endDialog(traceActivity);
    }

    protected onComputeId(): string {
        return `TraceActivity[${ this.name.toString() }]`;
    }
}
