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
export class TemplatesParser {

    /**
     * option regex.
     */
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

        return TemplatesParser.innerParseText(content, fullPath, importResolver, expressionParser);
    }

    /**
     * Parser to turn lg content into a Templates.
     * @param content text content contains lg templates.
     * @param id id is the identifier of content. If importResolver is undefined, id must be a full path string. 
     * @param importResolver resolver to resolve LG import id to template text.
     * @param expressionParser Expression parser for evaluating expressions.
     * @returns entity.
     */
    public static parseText(content: string, id: string = '', importResolver?: ImportResolverDelegate, expressionParser?: ExpressionParser): Templates {
        return TemplatesParser.innerParseText(content, id, importResolver, expressionParser);
    }

    /**
     * Parser to turn lg content into a Templates based on the original Templates.
     * @param content Text content contains lg templates.
     * @param originalTemplates original templates
     */
    public static parseTextWithRef(content: string, originalTemplates: Templates): Templates {
        if (!originalTemplates) {
            throw Error(`templates is empty`);
        }

        const id = 'inline content';
        let newTemplates = new Templates();
        newTemplates.content = content;
        newTemplates.id = id;
        newTemplates.importResolver = originalTemplates.importResolver;
        let diagnostics: Diagnostic[] = [];
        try {
            const antlrResult = this.antlrParse(content, id);
            const templates = antlrResult.templates;
            const imports = antlrResult.imports;
            const invalidTemplateErrors = antlrResult.invalidTemplateErrors;
            const options = antlrResult.options;
            templates.forEach(t => newTemplates.push(t));
            newTemplates.imports = imports;
            newTemplates.options = options;
            diagnostics = diagnostics.concat(invalidTemplateErrors);

            newTemplates.references = this.getReferences(newTemplates)
                .concat(originalTemplates.references)
                .concat([originalTemplates]);

            var semanticErrors = new StaticChecker(newTemplates).check();
            diagnostics = diagnostics.concat(semanticErrors);
        }
        catch (err) {
            if (err instanceof TemplateException) {
                diagnostics = diagnostics.concat(err.getDiagnostic());
            } else {
                diagnostics.push(this.buildDiagnostic(err.Message, undefined, id));
            }
        }

        newTemplates.diagnostics = diagnostics;

        return newTemplates;
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

    /**
     * Parser to turn lg content into a Templates.
     * @param content text content contains lg templates.
     * @param id id is the identifier of content. If importResolver is undefined, id must be a full path string. 
     * @param importResolver resolver to resolve LG import id to template text.
     * @param expressionParser Expression parser for evaluating expressions.
     * @param cachedTemplates give the file path and templates to avoid parsing and to improve performance.
     * @returns entity.
     */
    public static innerParseText(content: string,
        id: string = '',
        importResolver?: ImportResolverDelegate,
        expressionParser?: ExpressionParser,
        cachedTemplates?: Map<string, Templates>): Templates {
        cachedTemplates = cachedTemplates || new Map<string, Templates>();

        if (cachedTemplates.has(id)) {
            return cachedTemplates.get(id);
        }

        importResolver = importResolver || TemplatesParser.defaultFileResolver;
        let templates = new Templates();
        templates.content = content;
        templates.id = id;
        templates.importResolver = importResolver;
        if (expressionParser) {
            templates.expressionParser = expressionParser;
        }
        let diagnostics: Diagnostic[] = [];
        try {
            const parsedResult = TemplatesParser.antlrParse(content, id);
            parsedResult.templates.forEach(t => templates.push(t));
            templates.imports = parsedResult.imports;
            templates.options = parsedResult.options;

            diagnostics = diagnostics.concat(parsedResult.invalidTemplateErrors);
            templates.references = this.getReferences(templates, cachedTemplates);
            const semanticErrors = new StaticChecker(templates).check();
            diagnostics = diagnostics.concat(semanticErrors);
        } catch (err) {
            if (err instanceof TemplateException) {
                diagnostics = diagnostics.concat(err.getDiagnostic());
            } else {
                diagnostics.push(this.buildDiagnostic(err.Message, undefined, id));
            }
        }

        templates.diagnostics = diagnostics;

        return templates;
    }

    private static antlrParse(text: string, id: string = ''): { templates: Template[]; imports: TemplateImport[]; invalidTemplateErrors: Diagnostic[]; options: string[]} {
        const fileContext: FileContext = this.getFileContentContext(text, id);
        const templates: Template[] = this.extractLGTemplates(fileContext, text, id);
        const imports: TemplateImport[] = this.extractLGImports(fileContext, id);
        const invalidTemplateErrors: Diagnostic[] = this.getInvalidTemplateErrors(fileContext, id);
        const options: string[] = this.extractLGOptions(fileContext);
        return { templates, imports, invalidTemplateErrors, options};
    }

    private static getReferences(file: Templates, cachedTemplates?: Map<string, Templates>): Templates[] {
        var resourcesFound = new Set<Templates>();
        this.resolveImportResources(file, resourcesFound, cachedTemplates || new Map<string, Templates>());

        resourcesFound.delete(file);
        return Array.from(resourcesFound);
    }

    private static resolveImportResources(start: Templates, resourcesFound: Set<Templates>, cachedTemplates?: Map<string, Templates>): void {
        var resourceIds = start.imports.map((lg: TemplateImport): string => lg.id);
        resourcesFound.add(start);

        for (const id of resourceIds) {
            try {
                const result = start.importResolver(start.id, id);
                const content = result.content;
                const path = result.id;
                const notExist = Array.from(resourcesFound).filter((u): boolean => u.id === path).length === 0;
                if (notExist) {
                    let childResource: Templates;
                    if (cachedTemplates.has(path)) {
                        childResource = cachedTemplates.get(path);
                    } else {
                        childResource = TemplatesParser.innerParseText(content, path, start.importResolver, start.expressionParser, cachedTemplates);
                        cachedTemplates.set(path, childResource);
                    }

                    this.resolveImportResources(childResource, resourcesFound, cachedTemplates);
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
