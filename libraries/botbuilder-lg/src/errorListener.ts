
/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ANTLRErrorListener, RecognitionException, Recognizer } from 'antlr4ts';

// tslint:disable-next-line: completed-docs
export class ErrorListener implements ANTLRErrorListener<any> {

    public syntaxError<T>(
        recognizer: Recognizer<T, any>,
        offendingSymbol: T,
        line: number,
        charPositionInLine: number,
        msg: string,
        e: RecognitionException | undefined): void {
            throw Error(`[ERROR]: syntax error at line ${line}:${charPositionInLine} ${msg}`);
    }
}
