/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ANTLRInputStream } from 'antlr4ts/ANTLRInputStream';
import { CommonTokenStream } from 'antlr4ts/CommonTokenStream';
import { ErrorListener } from './errorListener';
import { LGFileLexer } from './generated/LGFileLexer';
import { FileContext, ImportDefinitionContext, LGFileParser, ParagraphContext, TemplateDefinitionContext, OptionsDefinitionContext } from './generated/LGFileParser';
import { TemplateImport } from './templateImport';
import { Template } from './template';
import { Templates } from './templates';
import { StaticChecker } from './staticChecker';
import { TemplateExtensions } from './templateExtensions';
import { TemplateException } from './templateException';
import * as path from 'path';
import * as fs from 'fs';
import { Diagnostic, DiagnosticSeverity } from './diagnostic';
import { Position } from './position';
import { ParserRuleContext } from 'antlr4ts';
import { Range } from './range';
import { ExpressionParser } from 'adaptive-expressions';

export declare type ImportResolverDelegate = (source: string, resourceId: string) => { content: string; id: string };

/**
 * LG Parser
 */
export class TemplateParser {

    /// <summary>
    /// option regex.
    /// </summary>
    private static readonly optionRegex: RegExp = new RegExp(/^> *!#(.*)$/);

    /**
    * parse a file and return LG file.
    * @param filePath LG absolute file path..
    * @param importResolver resolver to resolve LG import id to template text.
    * @param expressionParser Expression parser for evaluating expressions.
    * @returns new lg file.
    */
    public static parseFile(filePath: string, importResolver?: ImportResolverDelegate, expressionParser?: ExpressionParser): Templates {
        const fullPath = TemplateExtensions.normalizePath(filePath);
        const content = fs.readFileSync(fullPath, 'utf-8');

        return TemplateParser.parseText(content, fullPath, importResolver, expressionParser);
    }

    /**
     * Parser to turn lg content into a LGFile.
     * @param content text content contains lg templates.
     * @param id id is the identifier of content. If importResolver is undefined, id must be a full path string. 
     * @param importResolver resolver to resolve LG import id to template text.
     * @param expressionParser Expression parser for evaluating expressions.
     * @returns entity.
     */
    public static parseText(content: string, id: string = '', importResolver?: ImportResolverDelegate, expressionParser?: ExpressionParser): Templates {
        importResolver = importResolver || TemplateParser.defaultFileResolver;
        let lgFile = new Templates();
        lgFile.content = content;
        lgFile.id = id;
        lgFile.importResolver = importResolver;
        if (expressionParser) {
            lgFile.expressionParser = expressionParser;
        }
        let diagnostics: Diagnostic[] = [];
        try {
            const parsedResult = TemplateParser.antlrParse(content, id);
            lgFile.templates = parsedResult.templates;
            lgFile.imports = parsedResult.imports;
            lgFile.options = parsedResult.options;

            diagnostics = diagnostics.concat(parsedResult.invalidTemplateErrors);
            lgFile.references = this.getReferences(lgFile, importResolver);
            const semanticErrors = new StaticChecker(lgFile, lgFile.expressionParser).check();
            diagnostics = diagnostics.concat(semanticErrors);
        } catch (err) {
            if (err instanceof TemplateException) {
                diagnostics = diagnostics.concat(err.getDiagnostic());
            } else {
                diagnostics.push(this.buildDiagnostic(err.Message, undefined, id));
            }
        }

        lgFile.diagnostics = diagnostics;

        return lgFile;
    }

    /// <summary>
    /// Parser to turn lg content into a LGFile based on the original LGFile.
    /// </summary>
    /// <param name="content">Text content contains lg templates.</param>
    /// <param name="lgFile">original LGFile.</param>
    /// <returns>new LGFile entity.</returns>
    public static parseTextWithRef(content: string, lgFile: Templates): Templates {
        if (!lgFile) {
            throw Error(`LGFile`);
        }

        const id = 'inline content';
        let newLgFile = new Templates();
        newLgFile.content = content;
        newLgFile.id = id;
        newLgFile.importResolver = lgFile.importResolver;
        let diagnostics: Diagnostic[] = [];
        try {
            const antlrResult = this.antlrParse(content, id);
            const templates = antlrResult.templates;
            const imports = antlrResult.imports;
            const invalidTemplateErrors = antlrResult.invalidTemplateErrors;
            const options = antlrResult.options;
            newLgFile.templates = templates;
            newLgFile.imports = imports;
            newLgFile.options = options;
            diagnostics = diagnostics.concat(invalidTemplateErrors);

            newLgFile.references = this.getReferences(newLgFile, newLgFile.importResolver)
                .concat(lgFile.references)
                .concat([lgFile]);

            var semanticErrors = new StaticChecker(newLgFile).check();
            diagnostics = diagnostics.concat(semanticErrors);
        }
        catch (err) {
            if (err instanceof TemplateException) {
                diagnostics = diagnostics.concat(err.getDiagnostic());
            } else {
                diagnostics.push(this.buildDiagnostic(err.Message, undefined, id));
            }
        }

        newLgFile.diagnostics = diagnostics;

        return newLgFile;
    }

    public static defaultFileResolver(sourceId: string, resourceId: string): { content: string; id: string } {
        let importPath = TemplateExtensions.normalizePath(resourceId);
        if (!path.isAbsolute(importPath)) {
            // get full path for importPath relative to path which is doing the import.
            importPath = TemplateExtensions.normalizePath(path.join(path.dirname(sourceId), importPath));
        }
        if (!fs.existsSync(importPath) || !fs.statSync(importPath).isFile()) {
            throw Error(`Could not find file: ${ importPath }`);
        }
        const content: string = fs.readFileSync(importPath, 'utf-8');

        return { content, id: importPath };
    }

    private static antlrParse(text: string, id: string = ''): { templates: Template[]; imports: TemplateImport[]; invalidTemplateErrors: Diagnostic[]; options: string[]} {
        const fileContext: FileContext = this.getFileContentContext(text, id);
        const templates: Template[] = this.extractLGTemplates(fileContext, text, id);
        const imports: TemplateImport[] = this.extractLGImports(fileContext, id);
        const invalidTemplateErrors: Diagnostic[] = this.getInvalidTemplateErrors(fileContext, id);
        const options: string[] = this.extractLGOptions(fileContext);
        return { templates, imports, invalidTemplateErrors, options};
    }

    private static getReferences(file: Templates, importResolver: ImportResolverDelegate): Templates[] {
        var resourcesFound = new Set<Templates>();
        this.resolveImportResources(file, resourcesFound, importResolver);

        resourcesFound.delete(file);
        return Array.from(resourcesFound);
    }

    private static resolveImportResources(start: Templates, resourcesFound: Set<Templates>, importResolver: ImportResolverDelegate): void {
        var resourceIds = start.imports.map((lg: TemplateImport): string => lg.id);
        resourcesFound.add(start);

        for (const id of resourceIds) {
            try {
                const result = importResolver(start.id, id);
                const content = result.content;
                const path = result.id;
                const notExist = Array.from(resourcesFound).filter((u): boolean => u.id === path).length === 0;
                if (notExist) {
                    var childResource = TemplateParser.parseText(content, path, importResolver, start.expressionParser);
                    this.resolveImportResources(childResource, resourcesFound, importResolver);
                }
            }
            catch (err) {
                if (err instanceof TemplateException) {
                    throw err;
                } else {
                    throw new TemplateException(err.message, [this.buildDiagnostic(err.message, undefined, start.id)]);
                }
            }
        }
    }

    private static buildDiagnostic(message: string, context?: ParserRuleContext, source?: string): Diagnostic {
        message = message || '';
        const startPosition: Position = context === undefined ? new Position(0, 0) : new Position(context.start.line, context.start.charPositionInLine);
        const endPosition: Position = context === undefined ? new Position(0, 0) : new Position(context.stop.line, context.stop.charPositionInLine + context.stop.text.length);
        return new Diagnostic(new Range(startPosition, endPosition), message, DiagnosticSeverity.Error, source);
    }

    /**
    * Extract LG options from the parse tree of a file.
    * @param file LG file context from ANTLR parser. 
    * @returns a string list of options
    */
    private static extractLGOptions(file: FileContext): string[] {
        return  !file ? [] :
            file.paragraph()
                .map((x): OptionsDefinitionContext => x.optionsDefinition())
                .filter((x): boolean => x !== undefined)
                .map((t): string => this.extractOption(t.text))
                .filter((t): boolean => t !== undefined && t !== '');
    }

    private static extractOption(originalText: string): string
    {
        let result = '';
        if (!originalText)
        {
            return result;
        }

        var matchResult = originalText.match(this.optionRegex);
        if (matchResult && matchResult.length === 2)
        {
            result = matchResult[1];
        }

        return result;
    }

    private static getInvalidTemplateErrors(fileContext: FileContext, id: string): Diagnostic[] {
        let errorTemplates = [];
        if (fileContext !== undefined) {
            for (const parag of fileContext.paragraph()) {
                const errTem = parag.errorTemplate();
                if (errTem) {
                    errorTemplates = errorTemplates.concat(errTem);
                }
            }
        }

        return errorTemplates.map((u): Diagnostic => this.buildDiagnostic('error context.', u, id));
    }

    private static getFileContentContext(text: string, source: string): FileContext {
        if (!text) {
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

    private static extractLGTemplates(file: FileContext, lgfileContent: string, source: string = ''): Template[] {
        if (!file) {
            return [];
        }

        const templates: TemplateDefinitionContext[] = file.paragraph()
            .map((x: ParagraphContext): TemplateDefinitionContext => x.templateDefinition())
            .filter((x: TemplateDefinitionContext): boolean => x !== undefined);

        return templates.map((x: TemplateDefinitionContext): Template => new Template(x, lgfileContent, source));
    }

    private static extractLGImports(file: FileContext, source: string = ''): TemplateImport[] {
        if (!file) {
            return [];
        }

        const imports: ImportDefinitionContext[] = file.paragraph()
            .map((x: ParagraphContext): ImportDefinitionContext => x.importDefinition())
            .filter((x: ImportDefinitionContext): boolean => x !== undefined);

        return imports.map((x: ImportDefinitionContext): TemplateImport => new TemplateImport(x, source));
    }
}
