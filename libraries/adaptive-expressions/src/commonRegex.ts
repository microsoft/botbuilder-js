/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ANTLRErrorListener, ANTLRInputStream, CommonTokenStream, RecognitionException, Recognizer } from 'antlr4ts';
import { ParseTree } from 'antlr4ts/tree/ParseTree';
import * as LRUCache from 'lru-cache';
import { CommonRegexLexer, CommonRegexParser } from './generated';

// tslint:disable-next-line: completed-docs
export class ErrorListener implements ANTLRErrorListener<any> {
    public static readonly Instance: ErrorListener = new ErrorListener();

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

// tslint:disable-next-line: completed-docs
export class CommonRegex {
    public static regexCache: LRUCache<string, RegExp> = new LRUCache<string, RegExp>(15);
    public static CreateRegex(pattern: string): RegExp {

        let result: RegExp;
        if (pattern && this.regexCache.has(pattern)) {
            result = this.regexCache.get(pattern);
        } else {
            if (!pattern || !this.isCommonRegex(pattern)) {
                throw new Error(`A regular expression parsing error occurred.`);
            }

            result = this.getRegExpFromString(pattern);
            this.regexCache.set(pattern, result);
        }

        return result;
    }

    private static getRegExpFromString(pattern: string): RegExp {
        const flags: string[] = ['(?i)', '(?m)', '(?s)'];
        let flag = '';
        flags.forEach((e: string): void => {
            if (pattern.includes(e)) {
                flag += e.substr(2, 1);
                pattern = pattern.replace(e, '');
            }
        });

        let regexp: RegExp;
        if (flag) {
            regexp = new RegExp(`${ pattern }`, flag);
        } else {
            regexp = new RegExp(`${ pattern }`);
        }

        return regexp;
    }

    private static isCommonRegex(pattern: string): boolean {
        try {
            this.antlrParse(pattern);
        } catch (Exception) {
            return false;
        }

        return true;
    }

    private static antlrParse(pattern: string): ParseTree {
        const inputStream: ANTLRInputStream = new ANTLRInputStream(pattern);
        const lexer: CommonRegexLexer = new CommonRegexLexer(inputStream);
        const tokenStream: CommonTokenStream = new CommonTokenStream(lexer);
        const parser: CommonRegexParser = new CommonRegexParser(tokenStream);
        parser.removeErrorListeners();
        // tslint:disable-next-line: no-use-before-declare
        parser.addErrorListener(ErrorListener.Instance);
        parser.buildParseTree = true;

        return parser.parse();
    }
}