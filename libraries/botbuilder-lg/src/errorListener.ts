/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ANTLRErrorListener, RecognitionException, Recognizer } from 'antlr4ts';
import { Diagnostic, DiagnosticSeverity } from './diagnostic';
import { TemplateException } from './templateException';
import { Position } from './position';
import { Range } from './range';
import { TemplateErrors } from './templateErrors';

/**
 * LG parser error listener.
 */
export class ErrorListener implements ANTLRErrorListener<any> {
    private readonly source: string;
    private lineOffset: number;
    public constructor(errorSource: string, lineOffset?: number) {
        this.source = errorSource;
        if (lineOffset === undefined) {
            lineOffset = 0;
        }
        this.lineOffset = lineOffset;
    }

    public syntaxError<T>(
        recognizer: Recognizer<T, any>,
        offendingSymbol: any,
        line: number,
        charPositionInLine: number,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        msg: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        e: RecognitionException | undefined): void {
        const startPosition: Position = new Position(this.lineOffset + line, charPositionInLine);
        const stopPosition: Position = new Position(this.lineOffset + line, charPositionInLine + offendingSymbol.stopIndex - offendingSymbol.startIndex + 1);
        const range: Range = new Range(startPosition, stopPosition);
        const diagnostic: Diagnostic = new Diagnostic(range, TemplateErrors.syntaxError(msg), DiagnosticSeverity.Error, this.source);

        throw new TemplateException(diagnostic.toString(), [diagnostic]);
    }
}
