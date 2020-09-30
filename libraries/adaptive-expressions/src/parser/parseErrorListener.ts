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

    /**
     * Throws a syntax error based on the current context.
     * @param _recognizer An Antlr4 runtime recognizer.
     * @param _offendingSymbol The token violating the lexer rules.
     * @param line The line number where the error occurred.
     * @param charPositionInLine The position of character in the line where the error occurred.
     * @param msg The error message.
     * @param _e The RecognitionException.
     */
    public syntaxError<T>(
        _recognizer: Recognizer<T, any>,
        _offendingSymbol: T,
        line: number,
        charPositionInLine: number,
        msg: string,
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        _e: RecognitionException | undefined): void {
        throw Error(`syntax error at line ${ line }:${ charPositionInLine } ${ msg }`);
    }
}
