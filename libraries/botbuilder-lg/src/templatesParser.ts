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
import { FileContext, LGFileParser} from './generated/LGFileParser';
import { TemplateImport } from './templateImport';
import { Template } from './template';
import { Templates } from './templates';
import { StaticChecker } from './staticChecker';
import { TemplateExtensions } from './templateExtensions';
import { TemplateException } from './templateException';
import * as path from 'path';
import * as fs from 'fs';
import { Diagnostic, DiagnosticSeverity } from './diagnostic';
import { ParserRuleContext } from 'antlr4ts';
import { ExpressionParser } from 'adaptive-expressions';
import { AbstractParseTreeVisitor, ParseTree } from 'antlr4ts/tree';
import { LGTemplateParserVisitor } from './generated/LGTemplateParserVisitor';
import * as lp from './generated/LGFileParser';
import { TemplateErrors } from './templateErrors';
import { SourceRange } from './sourceRange';
import { LGTemplateLexer } from './generated/LGTemplateLexer';
import { LGTemplateParser, BodyContext } from './generated/LGTemplateParser';

export declare type ImportResolverDelegate = (source: string, resourceId: string) => { content: string; id: string };


/**
 * LG Parser
 */
export class TemplatesParser {

    /**
     * Inline text id.
     */
    public static readonly inlineContentId: string = 'inline content';

    /**
     * option regex.
     */
    public static readonly optionRegex: RegExp = new RegExp(/>\s*!#(.*)$/);

    /**
     * Import regex.
     */
    public static readonly importRegex: RegExp = new RegExp(/\[([^\]]*)\]\(([^\)]*)\)/);
    
    /**
    * parse a file and return LG file.
    * @param filePath LG absolute file path..
    * @param importResolver Resolver to resolve LG import id to template text.
    * @param expressionParser Expression parser for evaluating expressions.
    * @returns New lg file.
    */
    public static parseFile(filePath: string, importResolver?: ImportResolverDelegate, expressionParser?: ExpressionParser): Templates {
        const fullPath = TemplateExtensions.normalizePath(filePath);
        const content = fs.readFileSync(fullPath, 'utf-8');

        return TemplatesParser.innerParseText(content, fullPath, importResolver, expressionParser);
    }

    /**
     * Parser to turn lg content into a Templates.
     * @param content Text content contains lg templates.
     * @param id Id is the identifier of content. If importResolver is undefined, id must be a full path string. 
     * @param importResolver Resolver to resolve LG import id to template text.
     * @param expressionParser Expression parser for evaluating expressions.
     * @returns Entity.
     */
    public static parseText(content: string, id: string = '', importResolver?: ImportResolverDelegate, expressionParser?: ExpressionParser): Templates {
        return TemplatesParser.innerParseText(content, id, importResolver, expressionParser);
    }

    /**
     * Parser to turn lg content into a Templates based on the original Templates.
     * @param content Text content contains lg templates.
     * @param originalTemplates Original templates
     */
    public static parseTextWithRef(content: string, originalTemplates: Templates): Templates {
        if (!originalTemplates) {
            throw Error(`templates is empty`);
        }

        const id = TemplatesParser.inlineContentId;
        let newTemplates = new Templates();
        newTemplates.content = content;
        newTemplates.id = id;
        newTemplates.importResolver = originalTemplates.importResolver;
        newTemplates.options = originalTemplates.options;

        try {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            newTemplates = new TemplatesTransformer(newTemplates).transform(this.antlrParseTemplates(content, id));
            newTemplates.references = this.getReferences(newTemplates)
                .concat(originalTemplates.references)
                .concat([originalTemplates]);

            var semanticErrors = new StaticChecker(newTemplates).check();
            newTemplates.diagnostics.push(...semanticErrors);
        }
        catch (err) {
            if (err instanceof TemplateException) {
                newTemplates.diagnostics.push(...err.getDiagnostic());
            } else {
                throw err;
            }
        }

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
     * @param content Text content contains lg templates.
     * @param id Id is the identifier of content. If importResolver is undefined, id must be a full path string. 
     * @param importResolver Resolver to resolve LG import id to template text.
     * @param expressionParser Expression parser for evaluating expressions.
     * @param cachedTemplates Give the file path and templates to avoid parsing and to improve performance.
     * @returns Entity.
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

        try {
            // eslint-disable-next-line @typescript-eslint/no-use-before-define
            templates = new TemplatesTransformer(templates).transform(this.antlrParseTemplates(content, id));
            templates.references = this.getReferences(templates, cachedTemplates);
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

    private static getReferences(file: Templates, cachedTemplates?: Map<string, Templates>): Templates[] {
        var resourcesFound = new Set<Templates>();
        this.resolveImportResources(file, resourcesFound, cachedTemplates || new Map<string, Templates>());

        resourcesFound.delete(file);
        return Array.from(resourcesFound);
    }

    private static resolveImportResources(start: Templates, resourcesFound: Set<Templates>, cachedTemplates?: Map<string, Templates>): void {
        resourcesFound.add(start);

        for (const importItem of start.imports) {
            let content: string;
            let path: string;
            try {
                ({content, id: path} = start.importResolver(start.id, importItem.id));
            } catch (error) {
                const diagnostic = new Diagnostic(TemplateExtensions.convertToRange(importItem.sourceRange.parseTree), error.message, DiagnosticSeverity.Error, start.id);
                throw new TemplateException(error.message, [diagnostic]);
            }

            if (Array.from(resourcesFound).every((u): boolean => u.id !== path)) {
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
    }

    private static antlrParseTemplates(text: string, source: string): FileContext {
        if (!text || text.trim() === '') {
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
}


class TemplatesTransformer extends AbstractParseTreeVisitor<any> implements LGTemplateParserVisitor<any> {
    private readonly identifierRegex: RegExp = new RegExp(/^[0-9a-zA-Z_]+$/);
    private readonly templateNamePartRegex: RegExp = new RegExp(/^[a-zA-Z_][0-9a-zA-Z_]*$/);
    private readonly templates: Templates;

    public constructor(templates: Templates) {
        super();
        this.templates = templates;
    }

    public transform(parseTree: ParseTree): Templates {
        if (parseTree) {
            this.visit(parseTree);
        }

        return this.templates;
    }

    protected defaultResult(): any {
        return;
    }

    public visitErrorDefinition(context: lp.ErrorDefinitionContext): any {
        const lineContent = context.INVALID_LINE().text;
        if (lineContent === undefined || lineContent.trim() === '') {
            this.templates.diagnostics.push(this.buildTemplatesDiagnostic(TemplateErrors.syntaxError, context));
        }
        return;
    }

    public visitImportDefinition(context: lp.ImportDefinitionContext): any {
        const importStr = context.IMPORT().text;
        var groups = importStr.match(TemplatesParser.importRegex);
        if (groups && groups.length === 3) {
            const description = groups[1].trim();
            const id = groups[2].trim();
            const sourceRange = new SourceRange(context, this.templates.id);
            const templateImport = new TemplateImport(description, id, sourceRange);
            this.templates.imports.push(templateImport);
        }
        return;
    }

    public visitOptionDefinition(context: lp.OptionDefinitionContext): any {
        const optionStr = context.OPTION().text;
        let result = '';
        if (optionStr != undefined && optionStr.trim() !== '') {
            var groups = optionStr.match(TemplatesParser.optionRegex);
            if (groups && groups.length === 2) {
                result = groups[1].trim();
            }
        }

        if (result.trim() !== '') {
            this.templates.options.push(result);
        }
        return;
    }

    public visitTemplateDefinition(context: lp.TemplateDefinitionContext): any {
        const startLine = context.start.line;

        const templateNameLine = context.templateNameLine().TEMPLATE_NAME_LINE().text;
        let templateName: string;
        let parameters: string[];
        ({templateName, parameters} = this.extractTemplateNameLine(templateNameLine));

        if (this.templates.toArray().some((u): boolean => u.name === templateName)) {
            const diagnostic = this.buildTemplatesDiagnostic(TemplateErrors.duplicatedTemplateInSameTemplate(templateName), context.templateNameLine());
            this.templates.diagnostics.push(diagnostic);
        } else {
            let templateBody = context.templateBody().text;
            const file = context.parent.parent as lp.FileContext;
            const templateContextList = file.paragraph().map((u): lp.TemplateDefinitionContext => u.templateDefinition()).filter((u): boolean => u !== undefined);
            const isLastTemplate = templateContextList[templateContextList.length - 1] === context;
            if (!isLastTemplate) {
                templateBody = this.removeTrailingNewline(templateBody);
            }

            const sourceRange = new SourceRange(context, this.templates.id);
            const template = new Template(templateName, parameters, templateBody, sourceRange);

            this.checkTemplateName(templateName, context.templateNameLine());
            this.checkTemplateParameters(parameters, context.templateNameLine());
            template.templateBodyParseTree = this.checkTemplateBody(templateName, templateBody, context.templateBody(), startLine);

            this.templates.push(template);
        }
    }

    private checkTemplateName(templateName: string, context: ParserRuleContext): void {
        const functionNameSplitDot = templateName.split('.');
        for(let id of functionNameSplitDot) {
            if (!this.templateNamePartRegex.test(id)) {
                const diagnostic = this.buildTemplatesDiagnostic(TemplateErrors.invalidTemplateName, context);
                this.templates.diagnostics.push(diagnostic);
            }
        }
    }

    private checkTemplateParameters(parameters: string[], context: ParserRuleContext): void {
        for (const parameter of parameters) {
            if (!this.identifierRegex.test(parameter)) {
                const diagnostic = this.buildTemplatesDiagnostic(TemplateErrors.invalidTemplateName, context);
                this.templates.diagnostics.push(diagnostic);
            }
        }
    }

    private checkTemplateBody(templateName: string, templateBody: string, context: lp.TemplateBodyContext, startLine: number): BodyContext {
        if (templateBody === undefined || templateBody.trim() === '') {
            const diagnostic = this.buildTemplatesDiagnostic(TemplateErrors.noTemplateBody(templateName), context, DiagnosticSeverity.Warning);
            this.templates.diagnostics.push(diagnostic);
        } else {
            try {
                return this.antlrParseTemplate(templateBody, startLine);
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

    private antlrParseTemplate(templateBody: string, startLine: number): BodyContext {
        const input: ANTLRInputStream = new ANTLRInputStream(templateBody);
        const lexer: LGTemplateLexer = new LGTemplateLexer(input);
        lexer.removeErrorListeners();

        const tokens: CommonTokenStream = new CommonTokenStream(lexer);
        const parser: LGTemplateParser = new LGTemplateParser(tokens);
        parser.removeErrorListeners();
        parser.addErrorListener(new ErrorListener(this.templates.id, startLine));
        parser.buildParseTree = true;

        return parser.template().body();
    }

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

    private extractTemplateNameLine(templateNameLine: string): { templateName: string; parameters: string[] } {
        const hashIndex = templateNameLine.indexOf('#');
        templateNameLine = templateNameLine.substr(hashIndex + 1).trim();
        let templateName = templateNameLine;
        let parameters: string[] = [];
        const leftBracketIndex = templateNameLine.indexOf('(');
        if (leftBracketIndex >= 0 && templateNameLine.endsWith(')')) {
            templateName = templateNameLine.substr(0, leftBracketIndex).trim();
            const paramStr = templateNameLine.substr(leftBracketIndex + 1, templateNameLine.length - leftBracketIndex - 2);
            if (paramStr !== undefined && paramStr.trim() !== '') {
                parameters = paramStr.split(',').map((u: string): string => u.trim());
            }
        }

        return {templateName, parameters};
    }

    private buildTemplatesDiagnostic(errorMessage: string, context: ParserRuleContext, severity: DiagnosticSeverity = DiagnosticSeverity.Error): Diagnostic {
        return new Diagnostic(TemplateExtensions.convertToRange(context), errorMessage, severity, this.templates.id);
    }
}