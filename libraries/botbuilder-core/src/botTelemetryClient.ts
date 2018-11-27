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
    trackDependency(telemetry: { id: string, method: string, absoluteUrl: string, pathName: string, totalTime: number, success: boolean, resultCode: number });
    trackEvent(telemetry: {  name: string, properties?: {[key: string]: any}, metrics?: {[key: string]: number } });
    trackException(telemetry: { exception: Error, handledAt?: string, properties?: {[key:string]:string}, measurements?: {[key:string]:number}, severityLevel?: Severity });
    trackTrace(telemetry: { message: string, properties?: {[key:string]:string}, severityLevel?: Severity });
    flush();
}

export class NullTelemetryClient implements BotTelemetryClient {

    constructor (settings?: any) {
        // noop
    }

    trackDependency(telemetry: { id: string, method: string, absoluteUrl: string, pathName: string, totalTime: number, success: boolean, resultCode: number}) {
        // noop
    }

    trackEvent(telemetry: { name: string, properties?: {[key: string]: any}, metrics?: {[key: string]: number }})  {
        // noop
    }

    trackException(telemetry: { exception: Error, handledAt?: string, properties?: {[key:string]:string}, measurements?: {[key:string]:number}, severityLevel?: Severity})  {
        // noop
    }
    trackTrace(telemetry: { message: string, properties?: {[key:string]:string}, severityLevel?: Severity }) {
        // noop
    }

    flush()  {
        // noop
    }

}