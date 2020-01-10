/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { DialogTurnResult, DialogConfiguration, DialogContext, Dialog, Configurable } from 'botbuilder-dialogs';
import { Activity, ActivityTypes } from 'botbuilder-core';
import { Expression, ExpressionEngine } from 'botframework-expressions';

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

    disabled?: string;
}

export class TraceActivity<O extends object = {}> extends Dialog<O> implements Configurable {
    public static declarativeType = 'Microsoft.TraceActivity';

    public constructor();
    public constructor(name: string, valueType: string, value: string);
    public constructor(name?: string, valueType?: string, value?: string) {
        super();
        if (name) { this.name = name; }
        if (valueType) { this.valueType = valueType; }
        if (value) { this.value = value; }
    }

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

    private _disabled: Expression;


    public configure(config: TraceActivityConfiguration): this {
        return super.configure(config);
    }

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this._disabled) {
            const { value } = this._disabled.tryEvaluate(dc.state);
            if (!!value) {
                return await dc.endDialog();
            }
        }

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
