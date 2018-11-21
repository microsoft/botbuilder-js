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

export interface IBotTelemetryClient {
    trackDependency(id: string, method: string, absoluteUrl: string, pathName: string, totalTime: number, success: boolean, resultCode: number);
    trackEvent(name: string, properties?: {[key: string]: any}, metrics?: {[key: string]: number });
    trackException(exception: Error, handledAt?: string, properties?: {[key:string]:string}, measurements?: {[key:string]:number}, severityLevel?: Severity);
    trackTrace(message: string, properties?: {[key:string]:string}, severityLevel?: Severity);
    flush();
}