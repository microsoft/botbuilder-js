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
    Hint,
}

/**
 * Diagnostic class
 */
export class Diagnostic {
    code: string;
    range: Range;
    severity: DiagnosticSeverity;
    source: string;
    message: string;

    /**
     * Creates a new instance of the [Diagnostic](xref:botbuilder-lg.Diagnostic) class.
     *
     * @param range Range where the error or warning occurred.
     * @param message Error message of the error or warning.
     * @param severity Severity of the error or warning.
     * @param source Source of the error or warning occurred.
     * @param code Code or identifier of the error or warning.
     */
    constructor(
        range: Range,
        message: string,
        severity: DiagnosticSeverity = DiagnosticSeverity.Error,
        source?: string,
        code?: string
    ) {
        this.message = message;
        this.range = range;
        this.severity = severity;
        this.source = source;
        this.code = code;
    }

    /**
     * Returns a string that represents the current [Diagnostic](xref:botbuilder-lg.Diagnostic) object.
     *
     * @returns A string that represents the current [Diagnostic](xref:botbuilder-lg.Diagnostic).
     */
    toString(): string {
        // ignore error range if source is "inline content"
        if (this.source === TemplatesParser.inlineContentId) {
            return `[${DiagnosticSeverity[this.severity]}] ${this.source} ${this.message.toString()}`;
        } else {
            return `[${DiagnosticSeverity[this.severity]}] ${
                this.source
            } ${this.range.toString()}: ${this.message.toString()}`;
        }
    }
}
