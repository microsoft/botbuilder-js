/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, Dialog } from 'botbuilder-dialogs';
import { Activity } from 'botbuilder-core';

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

    constructor();
    constructor(name: string, valueType: string, value: string);
    constructor(name?: string, valueType?: string, value?: string) {
        super();
        if (name) { this.name = name; }
        if (valueType) { this.valueType = valueType; }
        if (value) { this.value = value; }
    }

    protected onComputeId(): string {
        return `TraceActivity[${this.name}]`;
    }

    public configure(config: TraceActivityConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext): Promise<DialogTurnResult> {
        // Ensure planning context and condition

        var value: Object = null;

        if (this.value) {
            value = dc.state.getValue(this.value);
        } else {
            value = dc.state.getMemorySnapshot();
        }

        var traceActivity: Activity = {
            name: "Trace",
            valueType: this.valueType ? this.valueType : "State",
            value: value
        } as Activity;
        await dc.context.sendActivity(traceActivity);

        return await dc.endDialog(traceActivity);
    }
}
