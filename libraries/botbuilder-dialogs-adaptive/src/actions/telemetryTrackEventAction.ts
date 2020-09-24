/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { StringExpression, BoolExpression } from 'adaptive-expressions';
import { Dialog, DialogContext, DialogTurnResult } from 'botbuilder-dialogs';
import { Converter } from 'botbuilder-dialogs-declarative';

/**
 * Converter to convert telemetry properties configuration.
 */
export class TelemetryPropertiesConverter implements Converter {
    public convert(properties: { [name: string]: string }): { [name: string]: StringExpression } {
        const result = {};
        for (const name in properties) {
            result[name] = new StringExpression(properties[name]);
        }
        return result;
    }
}

/**
 * Track a custom event.
 */
export class TelemetryTrackEventAction<O extends object = {}> extends Dialog {
    /**
     * Initialize a `TelemetryTrackEventAction` instance.
     */
    public constructor();
    public constructor(eventName: string, properties: { [name: string]: string });
    public constructor(eventName?: string, properties?: { [name: string]: string }) {
        super();
        if (eventName) { this.eventName = new StringExpression(eventName); }
        if (properties) {
            this.properties = {};
            for (const name in properties) {
                this.properties[name] = new StringExpression(properties[name]);
            }
        }
    }

    /**
     * Gets or sets an optional expression which if is true will disable this action.
     */
    public disabled: BoolExpression;

    /**
     * Gets or sets a name to use for the event.
     */
    public eventName: StringExpression;

    /**
     * Gets or sets the properties to attach to the tracked event.
     */
    public properties: { [name: string]: StringExpression };

    public async beginDialog(dc: DialogContext, options?: O): Promise<DialogTurnResult> {
        if (this.disabled && this.disabled.getValue(dc.state)) {
            return await dc.endDialog();
        }

        if (this.eventName) {
            const name = this.eventName.getValue(dc.state);
            const properties = {};
            if (this.properties) {
                for (const name in this.properties) {
                    properties[name] = this.properties[name].getValue(dc.state);
                }
            }
            this.telemetryClient.trackEvent({ name, properties });
        }

        return await dc.endDialog();
    }

    protected onComputeId(): string {
        return `TelemetryTrackEventAction[${ this.eventName && this.eventName.toString() }]`;
    }
}