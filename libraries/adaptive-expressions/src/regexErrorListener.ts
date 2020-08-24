/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ANTLRErrorListener, Recognizer, RecognitionException } from 'antlr4ts';

export class RegexErrorListener implements ANTLRErrorListener<any> {
    public static readonly Instance: RegexErrorListener = new RegexErrorListener();

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
