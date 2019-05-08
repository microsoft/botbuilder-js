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
import * as lp from './generated/LGFileParser';
import { LGTemplate} from './lgTemplate';

/**
 * LG Parser
 */
export class LGParser {
    public static Parse(text: string): LGTemplate[] {
        const fileContext: lp.FileContext = this.GetFileContext(text);

        return this.ToTemplates(fileContext);
    }

    private static GetFileContext(text: string): lp.FileContext {
        if (text === undefined
            || text === ''
            || text === null) {
            return undefined;
        }

        const input: ANTLRInputStream = new ANTLRInputStream(text);
        const lexer: LGFileLexer = new LGFileLexer(input);
        const tokens: CommonTokenStream = new CommonTokenStream(lexer);
        const parser: lp.LGFileParser = new lp.LGFileParser(tokens);
        parser.removeErrorListeners();
        parser.addErrorListener(new ErrorListener());
        parser.buildParseTree = true;

        return parser.file();
    }

    private static ToTemplates = (file: lp.FileContext): LGTemplate[] => {
        if (file === undefined
            || file === null) {
            return [];
        }

        const templates: lp.TemplateDefinitionContext[] = file.paragraph()
                                                          .map((x: lp.ParagraphContext) => x.templateDefinition())
                                                          .filter((x: lp.TemplateDefinitionContext) => x !== undefined);

        return templates.map((x: lp.TemplateDefinitionContext) => new LGTemplate(x));
    }
}