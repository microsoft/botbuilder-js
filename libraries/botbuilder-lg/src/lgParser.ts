/**
 * @module botbuilder-lg
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
import { FileContext, ImportDefinitionContext, LGFileParser, ParagraphContext, TemplateDefinitionContext } from './generated/LGFileParser';
import { LGImport } from './lgImport';
import { LGResource } from './lgResource';
import { LGTemplate } from './lgTemplate';

/**
 * LG Parser
 */
export class LGParser {
    public static parse(text: string, id: string = ''): LGResource {
        const fileContext: FileContext = this.getFileContentContext(text, id);
        const templates: LGTemplate[] = this.extractLGTemplates(fileContext, text, id);
        const imports: LGImport[] = this.extractLGImports(fileContext, id);

        return new LGResource(templates, imports, text, id);
    }

    private static getFileContentContext(text: string, source: string): FileContext {
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
        parser.addErrorListener(new ErrorListener(source));
        parser.buildParseTree = true;

        return parser.file();
    }

    private static extractLGTemplates(file: FileContext, lgfileContent: string, source: string = ''): LGTemplate[] {
        if (file === undefined
            || file === null) {
            return [];
        }

        const templates: TemplateDefinitionContext[] = file.paragraph()
            .map((x: ParagraphContext): TemplateDefinitionContext => x.templateDefinition())
            .filter((x: TemplateDefinitionContext): boolean => x !== undefined);

        return templates.map((x: TemplateDefinitionContext): LGTemplate => new LGTemplate(x, lgfileContent, source));
    }

    private static extractLGImports(file: FileContext, source: string = ''): LGImport[] {
        if (file === undefined
            || file === null) {
            return [];
        }

        const imports: ImportDefinitionContext[] = file.paragraph()
            .map((x: ParagraphContext): ImportDefinitionContext => x.importDefinition())
            .filter((x: ImportDefinitionContext): boolean => x !== undefined);

        return imports.map((x: ImportDefinitionContext): LGImport => new LGImport(x, source));
    }
}
