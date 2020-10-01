/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ANTLRErrorListener, RecognitionException, Recognizer } from 'antlr4ts';

// tslint:disable-next-line: completed-docs
/**
 * Expression parser error listener.
 */
export class ParseErrorListener implements ANTLRErrorListener<any> {
    public static readonly Instance: ParseErrorListener = new ParseErrorListener();

    public syntaxError<T>(
        _recognizer: Recognizer<T, any>,
        _offendingSymbol: T,
        line: number,
        charPositionInLine: number,
        msg: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _e: RecognitionException | undefined
    ): void {
        throw Error(`syntax error at line ${line}:${charPositionInLine} ${msg}`);
    }
}
