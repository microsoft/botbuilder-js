/* eslint-disable security/detect-non-literal-fs-filename */
/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as fs from 'fs';
import * as path from 'path';
import { ANTLRInputStream } from 'antlr4ts/ANTLRInputStream';
import { AbstractParseTreeVisitor, ParseTree } from 'antlr4ts/tree';
import { CommonTokenStream } from 'antlr4ts/CommonTokenStream';
import { Diagnostic, DiagnosticSeverity } from './diagnostic';
import { ErrorListener } from './errorListener';
import { ExpressionParser } from 'adaptive-expressions';
import { FileContext, LGFileParser } from './generated/LGFileParser';
import { LGFileLexer } from './generated/LGFileLexer';
import { LGResource } from './lgResource';
import { LGTemplateLexer } from './generated/LGTemplateLexer';
import { LGTemplateParserVisitor } from './generated/LGTemplateParserVisitor';
import { ParserRuleContext } from 'antlr4ts';
import { SourceRange } from './sourceRange';
import { StaticChecker } from './staticChecker';
import { Template } from './template';
import { TemplateErrors } from './templateErrors';
import { TemplateException } from './templateException';
import { TemplateExtensions } from './templateExtensions';
import { TemplateImport } from './templateImport';
import { Templates } from './templates';

import {
    BodyContext,
    KeyValueStructureValueContext,
    LGTemplateParser,
    StructuredTemplateBodyContext,
} from './generated/LGTemplateParser';

import {
    ErrorDefinitionContext,
    ImportDefinitionContext,
    OptionDefinitionContext,
    TemplateBodyContext,
    TemplateDefinitionContext,
} from './generated/LGFileParser';

export declare type ImportResolverDelegate = (lgResource: LGResource, resourceId: string) => LGResource;

/**
 * LG Parser
 */
export class TemplatesParser {
    /**
     * Inline text id.
     */
    static readonly inlineContentId: string = 'inline content';

    /**
     * option regex.
     */
    static readonly optionRegex: RegExp = new RegExp(/>\s*!#(.*)$/);

    /**
     * Import regex.
     */
    static readonly importRegex: RegExp = new RegExp(/\[([^\]]*)\]\(([^)]*)\)([\w\s]*)/);

    /**
     * Parse a file and return LG file.
     *
     * @param filePath LG absolute file path..
     * @param importResolver Resolver to resolve LG import id to template text.
     * @param expressionParser Expression parser for evaluating expressions.
     * @returns New lg file.
     */
    static parseFile(
        filePath: string,
        importResolver?: ImportResolverDelegate,
        expressionParser?: ExpressionParser
    ): Templates {
        const fullPath = TemplateExtensions.normalizePath(filePath);
        const content = fs.readFileSync(fullPath, 'utf-8');
        const resource = new LGResource(fullPath, fullPath, content);
        return TemplatesParser.parseResource(resource, importResolver, expressionParser);
    }

    /**
     * Parser to turn lg content into a Templates.
     *
     * @deprecated This method will soon be deprecated. Use ParseResource instead.
     * @param content Text content contains lg templates.
     * @param id Id is the identifier of content. If importResolver is undefined, id must be a full path string.
     * @param importResolver Resolver to resolve LG import id to template text.
     * @param expressionParser Expression parser for evaluating expressions.
     * @returns Entity.
     */
    static parseText(
        content: string,
        id = '',
        importResolver?: ImportResolverDelegate,
        expressionParser?: ExpressionParser
    ): Templates {
        const resource = new LGResource(id, id, content);
        return TemplatesParser.parseResource(resource, importResolver, expressionParser);
    }

    /**
     * Parser to turn lg content into a Templates.
     *
     * @param resource LG resource.
     * @param importResolver Resolver to resolve LG import id to template text.
     * @param expressionParser Expression parser for evaluating expressions.
     * @returns Entity.
     */
    static parseResource(
        resource: LGResource,
        importResolver?: ImportResolverDelegate,
        expressionParser?: ExpressionParser
    ): Templates {
        return TemplatesParser.innerParseResource(resource, importResolver, expressionParser);
    }

    /**
     * Parser to turn lg content into a Templates based on the original Templates.
     *
     * @param content Text content contains lg templates.
     * @param originalTemplates Original templates.
     * @returns Template containing lg content.
     */
    static parseTextWithRef(content: string, originalTemplates: Templates): Templates {
        if (!originalTemplates) {
            throw Error('templates is empty');
        }

        const id = TemplatesParser.inlineContentId;
        let newTemplates = new Templates();
        newTemplates.content = content;
        newTemplates.id = id;
        newTemplates.source = id;
        newTemplates.importResolver = originalTemplates.importResolver;
        newTemplates.options = originalTemplates.options;
        newTemplates.namedReferences = originalTemplates.namedReferences;
        try {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            const resource = new LGResource(id, id, content);
            newTemplates = new TemplatesTransformer(newTemplates).transform(this.antlrParseTemplates(resource));
            newTemplates.references = this.getReferences(newTemplates)
                .concat(originalTemplates.references)
                .concat([originalTemplates]);

            const semanticErrors = new StaticChecker(newTemplates).check();
            newTemplates.diagnostics.push(...semanticErrors);
        } catch (err) {
            if (err instanceof TemplateException) {
                newTemplates.diagnostics.push(...err.getDiagnostic());
            } else {
                throw err;
            }
        }

        return newTemplates;
    }
    /**
     * Default import resolver, using relative/absolute file path to access the file content.
     *
     * @param resource Original Resource.
     * @param resourceId Import path.
     * @returns Accessed lg resource.
     */
    static defaultFileResolver(resource: LGResource, resourceId: string): LGResource {
        // If the import id contains "#", we would cut it to use the left path.
        // for example: [import](a.b.c#d.lg), after convertion, id would be d.lg
        const hashIndex = resourceId.indexOf('#');
        if (hashIndex > 0) {
            resourceId = resourceId.substr(hashIndex + 1);
        }

        let importPath = TemplateExtensions.normalizePath(resourceId);
        if (!path.isAbsolute(importPath)) {
            // get full path for importPath relative to path which is doing the import.
            importPath = TemplateExtensions.normalizePath(path.join(path.dirname(resource.fullName), importPath));
        }
        if (!fs.existsSync(importPath) || !fs.statSync(importPath).isFile()) {
            throw Error(`Could not find file: ${importPath}`);
        }
        const content: string = fs.readFileSync(importPath, 'utf-8');

        return new LGResource(importPath, importPath, content);
    }

    /**
     * Parser to turn lg content into a Templates.
     *
     * @param resource LG resource.
     * @param importResolver Resolver to resolve LG import id to template text.
     * @param expressionParser Expression parser for evaluating expressions.
     * @param cachedTemplates Give the file path and templates to avoid parsing and to improve performance.
     * @param parentTemplates Parent visited Templates.
     * @returns Entity.
     */
    private static innerParseResource(
        resource: LGResource,
        importResolver?: ImportResolverDelegate,
        expressionParser?: ExpressionParser,
        cachedTemplates: Map<string, Templates> = new Map<string, Templates>(),
        parentTemplates: Templates[] = []
    ): Templates {
        if (!resource) {
            throw new Error('lg resource is empty.');
        }

        if (cachedTemplates.has(resource.id)) {
            return cachedTemplates.get(resource.id);
        }

        importResolver = importResolver || TemplatesParser.defaultFileResolver;
        let templates = new Templates();
        templates.content = resource.content;
        templates.id = resource.id;
        templates.source = resource.fullName;
        templates.importResolver = importResolver;
        if (expressionParser) {
            templates.expressionParser = expressionParser;
        }

        try {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            templates = new TemplatesTransformer(templates).transform(this.antlrParseTemplates(resource));
            templates.references = this.getReferences(templates, cachedTemplates, parentTemplates);
            const semanticErrors = new StaticChecker(templates).check();
            templates.diagnostics.push(...semanticErrors);
        } catch (err) {
            if (err instanceof TemplateException) {
                templates.diagnostics.push(...err.getDiagnostic());
            } else {
                throw err;
            }
        }
        return templates;
    }

    /**
     * Parse LG content and return the AST.
     *
     * @param resource LG resource.
     * @returns The abstract syntax tree of lg file.
     */
    static antlrParseTemplates(resource: LGResource): FileContext {
        if (!resource.content || resource.content.trim() === '') {
            return undefined;
        }

        const input: ANTLRInputStream = new ANTLRInputStream(resource.content);
        const lexer: LGFileLexer = new LGFileLexer(input);
        const tokens: CommonTokenStream = new CommonTokenStream(lexer);
        const parser: LGFileParser = new LGFileParser(tokens);
        parser.removeErrorListeners();
        parser.addErrorListener(new ErrorListener(resource.fullName));
        parser.buildParseTree = true;

        return parser.file();
    }

    /**
     * @private
     */
    private static getReferences(
        file: Templates,
        cachedTemplates: Map<string, Templates> = new Map<string, Templates>(),
        parentTemplates: Templates[] = []
    ): Templates[] {
        const resourcesFound = new Set<Templates>();
        this.resolveImportResources(file, resourcesFound, cachedTemplates, parentTemplates);

        resourcesFound.delete(file);
        return Array.from(resourcesFound);
    }

    /**
     * @private
     */
    private static resolveImportResources(
        start: Templates,
        resourcesFound: Set<Templates>,
        cachedTemplates: Map<string, Templates>,
        parentTemplates: Templates[]
    ): void {
        resourcesFound.add(start);
        parentTemplates.push(start);

        for (const importItem of start.imports) {
            let resource: LGResource;
            try {
                const originalResource = new LGResource(start.id, start.source, start.content);
                resource = start.importResolver(originalResource, importItem.id);
            } catch (error) {
                const diagnostic = new Diagnostic(
                    importItem.sourceRange.range,
                    error.message,
                    DiagnosticSeverity.Error,
                    start.source
                );
                throw new TemplateException(error.message, [diagnostic]);
            }

            // Cycle reference would throw exception to avoid infinite Loop.
            // Import self is allowed, and would ignore it.
            const parentTemplate = parentTemplates[parentTemplates.length - 1];
            if (parentTemplate.id !== resource.id && parentTemplates.some((u) => u.id === resource.id)) {
                const errorMsg = `${TemplateErrors.loopDetected} ${resource.id} => ${start.id}`;
                const diagnostic = new Diagnostic(
                    importItem.sourceRange.range,
                    errorMsg,
                    DiagnosticSeverity.Error,
                    start.source
                );
                throw new TemplateException(errorMsg, [diagnostic]);
            }

            if (importItem.alias) {
                // Import as alias
                // Append import templates into namedReferences property
                const childResource = this.innerParseResource(
                    resource,
                    start.importResolver,
                    start.expressionParser,
                    cachedTemplates,
                    parentTemplates
                );
                start.namedReferences[importItem.alias] = childResource;
                continue;
            }

            // normal import
            if (Array.from(resourcesFound).every((u): boolean => u.id !== resource.id)) {
                let childResource: Templates;
                if (cachedTemplates.has(resource.id)) {
                    childResource = cachedTemplates.get(resource.id);
                } else {
                    childResource = TemplatesParser.innerParseResource(
                        resource,
                        start.importResolver,
                        start.expressionParser,
                        cachedTemplates,
                        parentTemplates
                    );
                    cachedTemplates.set(resource.id, childResource);
                }

                this.resolveImportResources(childResource, resourcesFound, cachedTemplates, parentTemplates);
            }
        }
        parentTemplates.pop();
    }
}

/**
 * Templates transformer. Add more details and body context into the templates object.
 */
export class TemplatesTransformer extends AbstractParseTreeVisitor<void> implements LGTemplateParserVisitor<void> {
    private readonly identifierRegex: RegExp = new RegExp(/^[0-9a-zA-Z_]+$/);
    private readonly templateNamePartRegex: RegExp = new RegExp(/^[a-zA-Z_][0-9a-zA-Z_]*$/);
    private readonly templates: Templates;

    /**
     * Creates a new instance of the [TemplatesTransformer](xref:botbuilder-lg.TemplatesTransformer) class.
     *
     * @param templates Templates.
     */
    constructor(templates: Templates) {
        super();
        this.templates = templates;
    }

    /**
     * Transform the parse tree into templates.
     *
     * @param parseTree Input abstract syntax tree.
     * @returns Parse tree templates.
     */
    transform(parseTree: ParseTree): Templates {
        if (parseTree) {
            this.visit(parseTree);
        }
        const templateCount = this.templates.toArray().length;
        let currentIndex = 0;
        for (const template of this.templates) {
            currentIndex++;
            if (currentIndex < templateCount) {
                template.body = this.removeTrailingNewline(template.body);
            }
        }

        return this.templates;
    }

    /**
     * Gets the default value returned by visitor methods.
     * Method not implemented.
     */
    protected defaultResult(): void {
        return;
    }

    /**
     * Visit a parse tree produced by `LGFileParser.errorDefinition`.
     *
     * @param context The parse tree.
     */
    visitErrorDefinition(context: ErrorDefinitionContext): void {
        const lineContent = context.INVALID_LINE().text;
        if (lineContent === undefined || lineContent.trim() === '') {
            this.templates.diagnostics.push(
                this.buildTemplatesDiagnostic(
                    TemplateErrors.syntaxError(`Unexpected content: '${lineContent}'`),
                    context
                )
            );
        }
    }

    /**
     * Visit a parse tree produced by `LGFileParser.importDefinition`.
     *
     * @param context The parse tree.
     */
    visitImportDefinition(context: ImportDefinitionContext): void {
        const importStr = context.IMPORT().text;
        const groups = importStr.match(TemplatesParser.importRegex);
        if (!groups || (groups.length !== 3 && groups.length !== 4)) {
            this.templates.diagnostics.push(this.buildTemplatesDiagnostic(TemplateErrors.importFormatError, context));
            return;
        }

        const description = groups[1].trim();
        const id = groups[2].trim();
        const sourceRange = new SourceRange(context, this.templates.source);
        const templateImport = new TemplateImport(description, id, sourceRange);

        if (groups.length === 4) {
            const asAlias = groups[3].trim();
            if (asAlias) {
                const asAliasArray = asAlias.split(/\s+/);
                if (asAliasArray.length !== 2 || asAliasArray[0] !== 'as') {
                    this.templates.diagnostics.push(
                        this.buildTemplatesDiagnostic(TemplateErrors.importFormatError, context)
                    );
                    return;
                } else {
                    templateImport.alias = asAliasArray[1].trim();
                }
            }
        }

        this.templates.imports.push(templateImport);
    }

    /**
     * Visit a parse tree produced by `LGFileParser.optionDefinition`.
     *
     * @param context The parse tree.
     */
    visitOptionDefinition(context: OptionDefinitionContext): void {
        const optionStr = context.OPTION().text;
        let result = '';
        if (optionStr != undefined && optionStr.trim() !== '') {
            const groups = optionStr.match(TemplatesParser.optionRegex);
            if (groups && groups.length === 2) {
                result = groups[1].trim();
            }
        }

        if (result.trim() !== '') {
            this.templates.options.push(result);
        }
    }

    /**
     * Visit a parse tree produced by `LGFileParser.templateDefinition`.
     *
     * @param context The parse tree.
     */
    visitTemplateDefinition(context: TemplateDefinitionContext): void {
        const startLine = context.start.line;

        const templateNameLine = context.templateNameLine().TEMPLATE_NAME_LINE().text;
        const { templateName, parameters } = this.extractTemplateNameLine(templateNameLine);

        if (this.templates.toArray().some((u): boolean => u.name === templateName)) {
            const diagnostic = this.buildTemplatesDiagnostic(
                TemplateErrors.duplicatedTemplateInSameTemplate(templateName),
                context.templateNameLine()
            );
            this.templates.diagnostics.push(diagnostic);
        } else {
            const templateBody = context.templateBody().text;

            const sourceRange = new SourceRange(context, this.templates.source);
            const template = new Template(templateName, parameters, templateBody, sourceRange);

            this.checkTemplateName(templateName, context.templateNameLine());
            this.checkTemplateParameters(parameters, context.templateNameLine());
            this.checkTemplateBody(template, context.templateBody(), startLine);

            this.templates.push(template);
        }
    }

    /**
     * @private
     */
    private checkTemplateName(templateName: string, context: ParserRuleContext): void {
        const functionNameSplitDot = templateName.split('.');
        for (const id of functionNameSplitDot) {
            if (!this.templateNamePartRegex.test(id)) {
                const diagnostic = this.buildTemplatesDiagnostic(
                    TemplateErrors.invalidTemplateName(templateName),
                    context
                );
                this.templates.diagnostics.push(diagnostic);
                break;
            }
        }
    }

    /**
     * @private
     */
    private checkTemplateParameters(parameters: string[], context: ParserRuleContext): void {
        for (const parameter of parameters) {
            if (!this.identifierRegex.test(parameter)) {
                const diagnostic = this.buildTemplatesDiagnostic(TemplateErrors.invalidParameter(parameter), context);
                this.templates.diagnostics.push(diagnostic);
            }
        }
    }

    /**
     * @private
     */
    private checkTemplateBody(template: Template, context: TemplateBodyContext, startLine: number): BodyContext {
        if (template.body === undefined || template.body.trim() === '') {
            const diagnostic = this.buildTemplatesDiagnostic(
                TemplateErrors.noTemplateBody(template.name),
                context,
                DiagnosticSeverity.Warning
            );
            this.templates.diagnostics.push(diagnostic);
        } else {
            try {
                const templateBodyContext = this.antlrParseTemplate(template.body, startLine);
                if (templateBodyContext) {
                    template.templateBodyParseTree = templateBodyContext;
                    template = new TemplateBodyTransformer(template).transform();
                }
            } catch (error) {
                if (error instanceof TemplateException) {
                    this.templates.diagnostics.push(...error.getDiagnostic());
                } else {
                    throw error;
                }
            }
        }

        return undefined;
    }

    /**
     * @private
     */
    private antlrParseTemplate(templateBody: string, startLine: number): BodyContext {
        const input: ANTLRInputStream = new ANTLRInputStream(templateBody);
        const lexer: LGTemplateLexer = new LGTemplateLexer(input);
        lexer.removeErrorListeners();

        const tokens: CommonTokenStream = new CommonTokenStream(lexer);
        const parser: LGTemplateParser = new LGTemplateParser(tokens);
        parser.removeErrorListeners();
        parser.addErrorListener(new ErrorListener(this.templates.source, startLine));
        parser.buildParseTree = true;

        return parser.template().body();
    }

    /**
     * @private
     */
    private removeTrailingNewline(templateBody: string): string {
        // remove the end newline of middle template.
        let result = templateBody;
        if (result.endsWith('\n')) {
            result = result.substr(0, result.length - 1);
            if (result.endsWith('\r')) {
                result = result.substr(0, result.length - 1);
            }
        }

        return result;
    }

    /**
     * @private
     */
    private extractTemplateNameLine(templateNameLine: string): { templateName: string; parameters: string[] } {
        const hashIndex = templateNameLine.indexOf('#');
        templateNameLine = templateNameLine.substr(hashIndex + 1).trim();
        let templateName = templateNameLine;
        let parameters: string[] = [];
        const leftBracketIndex = templateNameLine.indexOf('(');
        if (leftBracketIndex >= 0 && templateNameLine.endsWith(')')) {
            templateName = templateNameLine.substr(0, leftBracketIndex).trim();
            const paramStr = templateNameLine.substr(
                leftBracketIndex + 1,
                templateNameLine.length - leftBracketIndex - 2
            );
            if (paramStr !== undefined && paramStr.trim() !== '') {
                parameters = paramStr.split(',').map((u: string): string => u.trim());
            }
        }

        return { templateName, parameters };
    }

    /**
     * @private
     */
    private buildTemplatesDiagnostic(
        errorMessage: string,
        context: ParserRuleContext,
        severity: DiagnosticSeverity = DiagnosticSeverity.Error
    ): Diagnostic {
        return new Diagnostic(
            TemplateExtensions.convertToRange(context),
            errorMessage,
            severity,
            this.templates.source
        );
    }
}

class TemplateBodyTransformer extends AbstractParseTreeVisitor<void> implements LGTemplateParserVisitor<void> {
    private _template: Template;
    constructor(template: Template) {
        super();
        this._template = template;
    }

    protected defaultResult(): void {}

    transform(): Template {
        this.visit(this._template.templateBodyParseTree);
        return this._template;
    }

    visitStructuredTemplateBody(context: StructuredTemplateBodyContext): void {
        if (
            !context.structuredBodyNameLine().errorStructuredName() &&
            context.structuredBodyEndLine() &&
            (!context.errorStructureLine() || context.errorStructureLine().length === 0) &&
            context.structuredBodyContentLine() &&
            context.structuredBodyContentLine().length > 0
        ) {
            const bodys = context.structuredBodyContentLine();
            for (const body of bodys) {
                if (body.keyValueStructureLine()) {
                    const structureKey = body.keyValueStructureLine().STRUCTURE_IDENTIFIER();
                    const structureValues = body.keyValueStructureLine().keyValueStructureValue();
                    const typeName = context.structuredBodyNameLine().STRUCTURE_NAME().text.trim();
                    this.fillInProperties(structureKey.text.trim(), structureValues, typeName);
                }
            }
        }
    }

    private fillInProperties(key: string, structureValues: KeyValueStructureValueContext[], name: string): void {
        if (!this._template.properties) {
            this._template.properties = {};
        }

        this._template.properties['$type'] = name;
        if (structureValues.length === 1) {
            this._template.properties[key] = structureValues[0].text;
        } else if (structureValues.length > 1) {
            this._template.properties[key] = structureValues.map((u) => u.text);
        }
    }
}
