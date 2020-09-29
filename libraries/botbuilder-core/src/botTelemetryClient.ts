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
export enum Severity
    {
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
    properties?: {[key: string]: any};
    metrics?: {[key: string]: number };
}

export interface TelemetryException { 
    exception: Error;
    handledAt?: string;
    properties?: {[key: string]: string};
    measurements?: {[key: string]: number};
    severityLevel?: Severity;
}

export interface TelemetryTrace {
    message: string;
    properties?: {[key: string]: string};
    severityLevel?: Severity;
}

export interface TelemetryPageView {
    name: string;
    properties?: {[key: string]: string};
    metrics?: {[key: string]: number };
}

/**
 * A null bot telemetry client that implements `IBotTelemetryClient`.
 */
export class NullTelemetryClient implements BotTelemetryClient, BotPageViewTelemetryClient {

    /**
     * Creates a new instance of the `NullTelemetryClient` class.
     * @param settings Optional. Settings for the telemetry client.
     */
    constructor(settings?: any) {
        // noop
    }

    /**
     * Logs an Application Insights page view.
     * @param telemetry Telemetry Page View.
     */
    trackPageView(telemetry: TelemetryPageView) {
        // noop
    }

    /**
     * Sends information about an external dependency (outgoing call) in the application.
     * @param telemetry Telemetry Dependency.
     */
    trackDependency(telemetry: TelemetryDependency) {
        // noop
    }

    /**
     * Logs custom events with extensible named fields.
     * @param telemetry Telemetry Event.
     */
    trackEvent(telemetry: TelemetryEvent) {
        // noop
    }

    /**
     * Logs a system exception.
     * @param telemetry Telemetry Exception to log.
     */
    trackException(telemetry: TelemetryException)  {
        // noop
    }

    /**
     * Sends a trace message.
     * @param telemetry Telemetry Trace.
     */
    trackTrace(telemetry: TelemetryTrace) {
        // noop
    }

    /**
     * Flushes the in-memory buffer and any metrics being pre-aggregated.
     */
    flush()  {
        // noop
    }
}

/**
 * Logs a DialogView using the TrackPageView method on the BotTelemetryClient if BotPageViewTelemetryClient has been implemented.
 * Alternatively logs the information out via TrackTrace.
 * @param telemetryClient TelemetryClient that implements BotTelemetryClient.
 * @param dialogName Name of the dialog to log the entry / start for.
 * @param properties Named string values you can use to search and classify events.
 * @param metrics Measurements associated with this event.
 */
export function telemetryTrackDialogView(telemetryClient: BotTelemetryClient, dialogName: string, properties?: {[key: string]: any}, metrics?: {[key: string]: number }): void {
    if (!clientSupportsTrackDialogView(telemetryClient)) {
        throw new TypeError('"telemetryClient" parameter does not have methods trackPageView() or trackTrace()');
    }
    if (instanceOfBotPageViewTelemetryClient(telemetryClient)) {
        telemetryClient.trackPageView({ name: dialogName, properties: properties, metrics: metrics });
    }
    else {
        telemetryClient.trackTrace({ message: 'Dialog View: ' + dialogName, severityLevel: Severity.Information } );
    }
}

function instanceOfBotPageViewTelemetryClient(object: any): object is BotPageViewTelemetryClient {
    return 'trackPageView' in object;
}

function clientSupportsTrackDialogView(client: any): boolean {
    if (!client) { return false; }
    if (typeof client.trackPageView !== 'function' && typeof client.trackTrace !== 'function') {
        return false;
    }
    return true;
}
