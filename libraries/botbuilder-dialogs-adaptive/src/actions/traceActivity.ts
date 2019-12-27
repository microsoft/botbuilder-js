/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, Dialog } from 'botbuilder-dialogs';
import { Activity, ActivityTypes } from 'botbuilder-core';

export interface TraceActivityConfiguration extends DialogConfiguration {
    /**
     * Gets or sets name of the trace activity.
     */
    name?: string;

    /**
     * Gets or sets value type of the trace activity.
     */
    valueType?: string;

    /**
     * Gets or sets value expression to send as the value.
     */
    value?: string;
}

export class TraceActivity<O extends object = {}> extends Dialog<O> {

    public static declarativeType = 'Microsoft.TraceActivity';

    /**
     * Gets or sets name of the trace activity.
     */
    public name?: string;

    /**
     * Gets or sets value type of the trace activity.
     */
    public valueType?: string;

    /**
     * Gets or sets value expression to send as the value.
     */
    public value?: string;

    public constructor();
    public constructor(name: string, valueType: string, value: string);
    public constructor(name?: string, valueType?: string, value?: string) {
        super();
        if (name) { this.name = name; }
        if (valueType) { this.valueType = valueType; }
        if (value) { this.value = value; }
    }

    public configure(config: TraceActivityConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        // Ensure planning context and condition

        let value: any;

        if (this.value) {
            value = dc.state.getValue(this.value);
        } else {
            value = dc.state.getMemorySnapshot();
        }

        const traceActivity: Partial<Activity> = {
            type: ActivityTypes.Trace,
            timestamp: new Date(),
            name: this.name || 'Trace',
            value: value,
            valueType: this.valueType || 'State'
        };
        await dc.context.sendActivity(traceActivity);
        return await dc.endDialog(traceActivity);
    }

    protected onComputeId(): string {
        return `TraceActivity[${ this.name }]`;
    }
}
