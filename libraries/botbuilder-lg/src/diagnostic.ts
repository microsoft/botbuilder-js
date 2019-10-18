/**
 * @module botbuilder-expression-lg
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
    public Code: string;
    public Range: Range;
    public Severity: DiagnosticSeverity;
    public Source: string;
    public Message: string;

    constructor(
        range: Range,
        message: string,
        severity: DiagnosticSeverity = DiagnosticSeverity.Error) {
        this.Message = message;
        this.Range = range;
        this.Severity = severity;
    }

    public toString(): string {

        // ignore error range if source is "inline"
        if (this.Source === 'inline') {
            return `[${DiagnosticSeverity[this.Severity]}] ${this.Message.toString()}`;
        } else {
            return `[${DiagnosticSeverity[this.Severity]}] ${this.Range.toString()}: ${this.Message.toString()}`;
        }
    }
}
