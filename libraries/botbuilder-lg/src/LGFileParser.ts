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
import { LGFileLexer } from './generated/LGFileLexer';
import { FileContext, LGFileParser, ParagraphContext, TemplateDefinitionContext } from './generated/LGFileParser';
import { LGTemplate} from './lgTemplate';

/**
 * LG Parser
 */

declare module './generated/LGFileParser' {
    interface LGFileParser {
        Parse(text: string): LGTemplate[];
    }
}

LGFileParser.prototype.Parse = (text: string): LGTemplate[] => {
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
    const file: FileContext = parser.file();

    if (file === undefined
        || file === null) {
        return [];
    }

    const templates: TemplateDefinitionContext[] = file.paragraph()
                                                      .map((x: ParagraphContext) => x.templateDefinition())
                                                      .filter((x: TemplateDefinitionContext) => x !== undefined);

    return templates.map((x: TemplateDefinitionContext) => new LGTemplate(x));
};

export * from './generated/LGFileParser';
