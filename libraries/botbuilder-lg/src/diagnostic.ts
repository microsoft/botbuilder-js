/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Range } from './range';

/**
 * DiagnosticSeverity enum
 */
export enum DiagnosticSeverity {
    Error,
    Warning,
    Information,
    Hint
}

/**
 * Diagnostic class
 */
export class Diagnostic {
    public code: string;
    public range: Range;
    public severity: DiagnosticSeverity;
    public source: string;
    public message: string;

    public constructor(
        range: Range,
        message: string,
        severity: DiagnosticSeverity = DiagnosticSeverity.Error,
        source?: string ,
        code?: string) {
        this.message = message;
        this.range = range;
        this.severity = severity;
        this.source = source;
        this.code = code;
    }

    public toString(): string {

        // ignore error range if source is "inline content"
        if (this.source === 'inline content') {
            return `[${ DiagnosticSeverity[this.severity] }] ${ this.message.toString() }`;
        } else {
            return `[${ DiagnosticSeverity[this.severity] }] ${ this.range.toString() }: ${ this.message.toString() }`;
        }
    }
}
