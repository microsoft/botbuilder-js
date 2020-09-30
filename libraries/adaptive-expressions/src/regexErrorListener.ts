/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ANTLRErrorListener, Recognizer, RecognitionException } from 'antlr4ts';

/**
 * Error listener for Regex.
 */
export class RegexErrorListener implements ANTLRErrorListener<any> {
    public static readonly Instance: RegexErrorListener = new RegexErrorListener();

    /**
     * Upon syntax error, notify any interested parties.
     * @param _recognizer What parser got the error. From this object, you can access the context as well as the input stream.
     * @param _offendingSymbol Offending token in the input token stream, unless recognizer is a lexer, then it's null.
     * @param line Line number in the input where the error occurred.
     * @param charPositionInLine Character position within the line where the error occurred.
     * @param msg Message to emit.
     * @param _e Exception generated by the parser that led to the reporting of an error.
     */
    public syntaxError<T>(
        _recognizer: Recognizer<T, any>,// eslint-disable-line @typescript-eslint/no-unused-vars
        _offendingSymbol: T,// eslint-disable-line @typescript-eslint/no-unused-vars
        line: number,// eslint-disable-line @typescript-eslint/no-unused-vars
        charPositionInLine: number,// eslint-disable-line @typescript-eslint/no-unused-vars
        msg: string,// eslint-disable-line @typescript-eslint/no-unused-vars
        _e: RecognitionException | undefined): void {// eslint-disable-line @typescript-eslint/no-unused-vars
        
        throw Error(`Regular expression is invalid.`);
    }
}
