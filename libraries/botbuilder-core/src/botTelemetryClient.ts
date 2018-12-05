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
    properties?: {[key:string]:string};
    measurements?: {[key:string]:number};
    severityLevel?: Severity;
}

export interface TelemetryTrace {
    message: string;
    properties?: {[key:string]:string};
    severityLevel?: Severity;
}

export class NullTelemetryClient implements BotTelemetryClient {

    constructor (settings?: any) {
        // noop
    }

    trackDependency(telemetry: TelemetryDependency) {
        // noop
    }

    trackEvent(telemetry: TelemetryEvent)  {
        // noop
    }

    trackException(telemetry: TelemetryException)  {
        // noop
    }
    trackTrace(telemetry: TelemetryTrace) {
        // noop
    }

    flush()  {
        // noop
    }

}