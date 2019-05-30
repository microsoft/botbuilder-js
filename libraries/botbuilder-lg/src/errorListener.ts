/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ANTLRErrorListener, RecognitionException, Recognizer, Token } from 'antlr4ts';
import { Diagnostic, Position, Range } from './diagnostic';

// tslint:disable-next-line: completed-docs
export class ErrorListener implements ANTLRErrorListener<any> {

    public syntaxError<T>(
        recognizer: Recognizer<T, any>,
        offendingSymbol: any,
        line: number,
        charPositionInLine: number,
        msg: string,
        e: RecognitionException | undefined): void {
            const startPosition: Position = new Position(line - 1, charPositionInLine);
            // tslint:disable-next-line: max-line-length
            const stopPosition: Position = new Position(line - 1, charPositionInLine + offendingSymbol.stopIndex - offendingSymbol.startIndex + 1);
            const range: Range = new Range(startPosition, stopPosition);
            msg = 'syntax error at '.concat(msg);
            const diagnostic: Diagnostic = new Diagnostic(range, msg);

            throw new Error(JSON.stringify(diagnostic));
    }
}
