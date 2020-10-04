/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Defines the level of severity for the event.
 */
export enum Severity {
    Verbose = 0,
    Information = 1,
    Warning = 2,
    Error = 3,
    Critical = 4,
}

export interface BotTelemetryClient {
    trackDependency(telemetry: TelemetryDependency);
    trackEvent(telemetry: TelemetryEvent);
    trackException(telemetry: TelemetryException);
    trackTrace(telemetry: TelemetryTrace);
    flush();
}

export interface BotPageViewTelemetryClient {
    trackPageView(telemetry: TelemetryPageView);
}

export interface TelemetryDependency {
    dependencyTypeName: string;
    target: string;
    name: string;
    data: string;
    duration: number;
    success: boolean;
    resultCode: number;
}

export interface TelemetryEvent {
    name: string;
    properties?: { [key: string]: any };
    metrics?: { [key: string]: number };
}

export interface TelemetryException {
    exception: Error;
    handledAt?: string;
    properties?: { [key: string]: string };
    measurements?: { [key: string]: number };
    severityLevel?: Severity;
}

export interface TelemetryTrace {
    message: string;
    properties?: { [key: string]: string };
    severityLevel?: Severity;
}

export interface TelemetryPageView {
    name: string;
    properties?: { [key: string]: string };
    metrics?: { [key: string]: number };
}

export class NullTelemetryClient implements BotTelemetryClient, BotPageViewTelemetryClient {
    constructor(settings?: any) {
        // noop
    }

    trackPageView(telemetry: TelemetryPageView) {
        // noop
    }

    trackDependency(telemetry: TelemetryDependency) {
        // noop
    }

    trackEvent(telemetry: TelemetryEvent) {
        // noop
    }

    trackException(telemetry: TelemetryException) {
        // noop
    }

    trackTrace(telemetry: TelemetryTrace) {
        // noop
    }

    flush() {
        // noop
    }
}

export function telemetryTrackDialogView(
    telemetryClient: BotTelemetryClient,
    dialogName: string,
    properties?: { [key: string]: any },
    metrics?: { [key: string]: number }
): void {
    if (!clientSupportsTrackDialogView(telemetryClient)) {
        throw new TypeError('"telemetryClient" parameter does not have methods trackPageView() or trackTrace()');
    }
    if (instanceOfBotPageViewTelemetryClient(telemetryClient)) {
        telemetryClient.trackPageView({ name: dialogName, properties: properties, metrics: metrics });
    } else {
        telemetryClient.trackTrace({ message: 'Dialog View: ' + dialogName, severityLevel: Severity.Information });
    }
}

function instanceOfBotPageViewTelemetryClient(object: any): object is BotPageViewTelemetryClient {
    return 'trackPageView' in object;
}

function clientSupportsTrackDialogView(client: any): boolean {
    if (!client) {
        return false;
    }
    if (typeof client.trackPageView !== 'function' && typeof client.trackTrace !== 'function') {
        return false;
    }
    return true;
}
