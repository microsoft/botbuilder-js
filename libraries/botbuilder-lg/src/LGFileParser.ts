/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line: no-submodule-imports
import { ANTLRInputStream } from 'antlr4ts/ANTLRInputStream';
// tslint:disable-next-line: no-submodule-imports
import { CommonTokenStream } from 'antlr4ts/CommonTokenStream';
import { ErrorListener } from './errorListener';
import { Extension } from './Extension';
import { LGFileLexer } from './generated/LGFileLexer';
import { FileContext, LGFileParser } from './generated/LGFileParser';
import { LGTemplate} from './lgTemplate';

/**
 * LG Parser
 */

declare module './generated/LGFileParser' {
    interface LGFileParser {
        Parse(text: string, source: string): LGTemplate[];
    }
}

LGFileParser.prototype.Parse = (text: string, source: string = ''): LGTemplate[] => {
    const fileContext: FileContext = GetFileContentContext(text);

    return Extension.ToLGTemplates(fileContext, source);
};

function GetFileContentContext(text: string): FileContext {
    if (text === undefined
        || text === ''
        || text === null) {
        return undefined;
    }

    const input: ANTLRInputStream = new ANTLRInputStream(text);
    const lexer: LGFileLexer = new LGFileLexer(input);
    const tokens: CommonTokenStream = new CommonTokenStream(lexer);
    const parser: LGFileParser = new LGFileParser(tokens);
    parser.removeErrorListeners();
    parser.addErrorListener(new ErrorListener());
    parser.buildParseTree = true;

    return parser.file();
}

export * from './generated/LGFileParser';
