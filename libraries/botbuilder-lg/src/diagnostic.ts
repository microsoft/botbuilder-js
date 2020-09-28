/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Range } from './range';
import { TemplatesParser } from './templatesParser';

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

    /**
     * Creates a new instance of the Diagnostic class.
     * @param range Range where the error or warning occurred.
     * @param message Error message of the error or warning.
     * @param severity Severity of the error or warning.
     * @param source Source of the error or warning occurred.
     * @param code Code or identifier of the error or warning.
     */
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

    /**
     * Returns a string that represents the current Diagnostic object.
     * @returns A string that represents the current Diagnostic.
     */
    public toString(): string {
        // ignore error range if source is "inline content"
        if (this.source === TemplatesParser.inlineContentId) {
            return `[${ DiagnosticSeverity[this.severity] }] ${ this.source } ${ this.message.toString() }`;
        } else {
            return `[${ DiagnosticSeverity[this.severity] }] ${ this.source } ${ this.range.toString() }: ${ this.message.toString() }`;
        }
    }
}
