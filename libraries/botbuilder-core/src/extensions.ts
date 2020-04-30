/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { BotTelemetryClient, BotPageViewTelemetryClient, Severity } from './botTelemetryClient';

/**
 * Some util and extension functions
 */
export class Extensions {

    public static TelemetryTrackDialogView(telemetryClient: BotTelemetryClient, dialogName: string, properties?: {[key: string]: any}, metrics?: {[key: string]: number }): void
    {
        if (this.instanceOfBotPageViewTelemetryClient(telemetryClient))
        {
            telemetryClient.trackPageView({ name: dialogName, properties: properties, metrics: metrics });
        }
        else
        {
            telemetryClient.trackTrace({ message: 'Dialog View: ' + dialogName, severityLevel: Severity.Information } );
        }
    }

    private static instanceOfBotPageViewTelemetryClient(object: any): object is BotPageViewTelemetryClient {
        return 'trackPageView' in object;
    }
}
