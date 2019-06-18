
/**
 * @module botbuilder-expression
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ANTLRErrorListener, ANTLRInputStream, CommonTokenStream, RecognitionException, Recognizer } from 'antlr4ts';
import { ParseTree } from "antlr4ts/tree/ParseTree";
import { CommonRegexLexer, CommonRegexParser } from './generated';

export class CommonRegex {
    public static CreateRegex(pattern: string): RegExp {
        if (pattern === undefined || pattern === '' || !this.IsCommonRegex(pattern)) {
            throw new Error(`A regular expression parsing error occurred.`);
        }
        const flags: string[] = ['(?i)', '(?J)', '(?m)', '(?s)', '(?U)', '(?x)'];
        let flag: string = '';
        flags.forEach((e: string) => {
            if (pattern.includes(e)) {
                flag += e.substr(2, 1);
                pattern = pattern.replace(e, '');
            }
        });

        let regexp: RegExp;
        if (flag !== '') {
            regexp = new RegExp(`${pattern}`, flag);
        } else {
            regexp = new RegExp(`${pattern}`);
        }

        return regexp;
    }

    private static IsCommonRegex(pattern: string): boolean {
        try {
            this.AntlrParse(pattern);
        } catch (Exception) {
            return false;
        }

        return true;
    }

    private static AntlrParse(pattern: string): ParseTree {
        const inputStream: ANTLRInputStream = new ANTLRInputStream(pattern);
        const lexer: CommonRegexLexer = new CommonRegexLexer(inputStream);
        const tokenStream: CommonTokenStream = new CommonTokenStream(lexer);
        const parser: CommonRegexParser = new CommonRegexParser(tokenStream);
        parser.removeErrorListeners();
        parser.addErrorListener(ErrorListener.Instance);
        parser.buildParseTree = true;

        return parser.parse();
    }
 }

 // tslint:disable-next-line: completed-docs
export class ErrorListener implements ANTLRErrorListener<any> {
     public static readonly Instance: ErrorListener = new ErrorListener();

     public syntaxError<T>(
        _recognizer: Recognizer<T, any>,
        _offendingSymbol: T,
        line: number,
        charPositionInLine: number,
        msg: string,
        _e: RecognitionException | undefined): void {
             throw Error(`Regular expression is invalid.`);
     }
 }
