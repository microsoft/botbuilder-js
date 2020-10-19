/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ANTLRErrorListener, Recognizer, RecognitionException } from 'antlr4ts';

// re-enable when this rule honors underscore prefix
/* eslint-disable @typescript-eslint/no-unused-vars */

export class RegexErrorListener implements ANTLRErrorListener<any> {
    public static readonly Instance: RegexErrorListener = new RegexErrorListener();

    public syntaxError<T>(
        _recognizer: Recognizer<T, any>,
        _offendingSymbol: T,
        _line: number,
        _charPositionInLine: number,
        _msg: string,
        _e: RecognitionException | undefined
    ): void {
        throw Error(`Regular expression is invalid.`);
    }
}
