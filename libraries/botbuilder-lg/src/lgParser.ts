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
import { Diagnostic } from './diagnostic';
import { ErrorListener } from './errorListener';
import { LGFileLexer } from './generated/LGFileLexer';
import { FileContext, ImportDefinitionContext, LGFileParser, ParagraphContext, TemplateDefinitionContext } from './generated/LGFileParser';
import { LGImport } from './LGImport';
import { LGResource } from './LGResource';
import { LGTemplate } from './lgTemplate';

/**
 * LG Parser
 */
export class LGParser {
    public static Parse(text: string, id: string = ''): LGResource {
        const parseResult: any = this.TryParse(text, id);
        if (!parseResult.isValid) {
            throw new Error(parseResult.error.toString());
        }

        return new LGResource(parseResult.templates, parseResult.imports, id);
    }

    public static TryParse(text: string, id: string = '')
        : { isValid: boolean; templates: LGTemplate[]; imports: LGImport[]; error: Diagnostic } {
        let fileContext: FileContext;
        let isValid: boolean = true;
        let error: Diagnostic;
        let templates: LGTemplate[] = [];
        let imports: LGImport[] = [];

        try {
            fileContext = this.GetFileContentContext(text, id);
        } catch (e) {
            error = Object.assign(new Diagnostic(undefined, undefined), JSON.parse(e.message));
            isValid = false;
        }

        templates = this.ExtractLGTemplates(fileContext, id);
        imports = this.ExtractLGImports(fileContext, id);

        return { isValid, templates, imports, error };
    }

    private static GetFileContentContext(text: string, source: string): FileContext {
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

    private static ExtractLGTemplates(file: FileContext, source: string = ''): LGTemplate[] {
        if (file === undefined
            || file === null) {
            return [];
        }

        const templates: TemplateDefinitionContext[] = file.paragraph()
            .map((x: ParagraphContext) => x.templateDefinition())
            .filter((x: TemplateDefinitionContext) => x !== undefined);

        return templates.map((x: TemplateDefinitionContext) => new LGTemplate(x, source));
    }

    private static ExtractLGImports(file: FileContext, source: string = ''): LGImport[] {
        if (file === undefined
            || file === null) {
            return [];
        }

        const imports: ImportDefinitionContext[] = file.paragraph()
            .map((x: ParagraphContext) => x.importDefinition())
            .filter((x: ImportDefinitionContext) => x !== undefined);

        return imports.map((x: ImportDefinitionContext) => new LGImport(x, source));
    }
}
