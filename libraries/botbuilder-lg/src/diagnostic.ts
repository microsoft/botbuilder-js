/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

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

/**
 * Range class
 */
export class Range {
    public Start: Position;
    public End: Position;

    constructor(start: Position, end: Position) {
        this.Start = start;
        this.End = end;
    }

    public toString = (): string => {
        let result: string = this.Start.toString();
        if (this.Start.Line <= this.End.Line && this.Start.Character < this.End.Character) {
            result += ' - ';
            result += this.End.toString();
        }

        return result;
    }
}

/**
 * Position class
 */
export class Position {
    public Line: number;
    public Character: number;

    constructor(line: number, character: number) {
        this.Line = line;
        this.Character = character;
    }

    public test = (): string => 'Hello';
    public toString = (): string => `line ${this.Line}:${this.Character}`;
}

/**
 * DiagnosticSeverity enum
 */
export enum DiagnosticSeverity {
    Error,
    Warning,
    Information,
    Hint
}
