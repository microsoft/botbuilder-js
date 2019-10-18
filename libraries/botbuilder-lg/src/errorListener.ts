/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ANTLRErrorListener, RecognitionException, Recognizer, Token } from 'antlr4ts';
import { Diagnostic } from './diagnostic';
import { LGException } from './lgException';
import { Position } from './position';
import { Range } from './range';

// tslint:disable-next-line: completed-docs
export class ErrorListener implements ANTLRErrorListener<any> {
    private source: string;
    public constructor(errorSource: string) {
        this.source = errorSource;
    }

    public syntaxError<T>(
        recognizer: Recognizer<T, any>,
        offendingSymbol: any,
        line: number,
        charPositionInLine: number,
        msg: string,
        e: RecognitionException | undefined): void {
            const startPosition: Position = new Position(line, charPositionInLine);
            // tslint:disable-next-line: max-line-length
            const stopPosition: Position = new Position(line, charPositionInLine + offendingSymbol.stopIndex - offendingSymbol.startIndex + 1);
            const range: Range = new Range(startPosition, stopPosition);
            msg = `syntax error message: ${msg}`;
            if (this.source !== undefined && this.source !== '') {
                msg = `source: ${this.source}, ${msg}`;
            }
            const diagnostic: Diagnostic = new Diagnostic(range, msg);

            throw new LGException(diagnostic.toString(), [diagnostic]);
    }
}
