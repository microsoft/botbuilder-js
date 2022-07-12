/* eslint-disable security/detect-object-injection */
/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { v4 as uuidv4 } from 'uuid';
import { Template } from './template';
import { TemplateImport } from './templateImport';
import { Diagnostic, DiagnosticSeverity } from './diagnostic';
import {
    ExpressionParser,
    Expression,
    ExpressionEvaluator,
    ReturnType,
    FunctionUtils,
    SimpleObjectMemory,
    ValueWithError,
} from 'adaptive-expressions';
import { ImportResolverDelegate, TemplatesTransformer } from './templatesParser';
import { Evaluator } from './evaluator';
import { Expander } from './expander';
import { Analyzer } from './analyzer';
import { TemplatesParser } from './templatesParser';
import { AnalyzerResult } from './analyzerResult';
import { TemplateErrors } from './templateErrors';
import { TemplateExtensions } from './templateExtensions';
import { EvaluationOptions, LGLineBreakStyle } from './evaluationOptions';
import { basename } from 'path';
import { StaticChecker } from './staticChecker';
import { LGResource } from './lgResource';
import { CustomizedMemory } from './customizedMemory';
import { AnalyzerOptions } from './analyzerOptions';

/**
 * LG entrance, including properties that LG file has, and evaluate functions.
 */
export class Templates implements Iterable<Template> {
    /**
     * Temp Template ID for inline content.
     */
    static readonly inlineTemplateIdPrefix: string = '__temp__';
    /**
     * Indicates whether fromFile is allowed in LG templates.
     */
    static enableFromFile = false;

    private readonly newLineRegex = /(\r?\n)/g;
    private readonly newLine: string = '\r\n';
    private readonly namespaceKey = '@namespace';
    private readonly exportsKey = '@exports';
    private items: Template[];

    /**
     * import elements that this LG file contains directly.
     */
    imports: TemplateImport[];

    /**
     * diagnostics.
     */
    diagnostics: Diagnostic[];

    /**
     * all references that this LG file has from Imports
     * otice: reference includs all child imports from the lg file,
     * not only the children belong to this lgfile directly.
     * so, reference count may >= imports count.
     */
    references: Templates[];

    /**
     * LG content.
     */
    content: string;

    /**
     * Id of the lg resource.
     */
    id: string;

    /**
     * expression parser.
     */
    expressionParser: ExpressionParser;

    /**
     * Source of the lg resource. Full path for lg file.
     */
    source: string;

    /**
     * Delegate for resolving resource id of imported lg file.
     */
    importResolver: ImportResolverDelegate;

    /**
     * LG file options.
     */
    options: string[];

    /**
     * Map from import alias to templates.
     */
    namedReferences: Record<string, Templates>;

    /**
     * Creates a new instance of the [Templates](xref:botbuilder-lg.Templates) class.
     *
     * @param items Optional. List of [Template](xref:botbuilder-lg.Template) instances.
     * @param imports Optional. List of [TemplateImport](xref:botbuilder-lg.TemplateImport) instances.
     * @param diagnostics Optional. List of [Diagnostic](xref:botbuilder-lg.Diagnostic) instances.
     * @param references Optional. List of [Templates](xref:botbuilder-lg.Templates) instances.
     * @param content Optional. Content of the current Templates instance.
     * @param id Optional. Id of the current Templates instance.
     * @param expressionParser Optional. [ExpressionParser](xref:adaptive-expressions.ExpressionParser) to parse the expressions in the content.
     * @param importResolverDelegate Optional. Resolver to resolve LG import id to template text.
     * @param options Optional. List of strings representing the options during evaluation of the templates.
     * @param source Optional. Templates source.
     * @param namedReferences Optional. eferences that imported with the "as" syntax，for example: [import](path.lg) as myAlias.
     */
    constructor(
        items?: Template[],
        imports?: TemplateImport[],
        diagnostics?: Diagnostic[],
        references?: Templates[],
        content?: string,
        id?: string,
        expressionParser?: ExpressionParser,
        importResolverDelegate?: ImportResolverDelegate,
        options?: string[],
        source?: string,
        namedReferences?: Record<string, Templates>
    ) {
        this.items = items || [];
        this.imports = imports || [];
        this.diagnostics = diagnostics || [];
        this.references = references || [];
        this.content = content || '';
        this.id = id || '';
        this.expressionParser = expressionParser || new ExpressionParser();
        this.importResolver = importResolverDelegate;
        this.options = options || [];
        this.source = source;
        this.namedReferences = namedReferences || {};
        this.injectToExpressionFunction();
    }

    /**
     * Iterates over values in the template collection.
     *
     * @returns A new iterator for the template collection.
     */
    [Symbol.iterator](): Iterator<Template> {
        let index = 0;
        return {
            next: (): IteratorResult<Template> => {
                if (index < this.items.length) {
                    return { done: false, value: this.items[index++] };
                } else {
                    return { done: true, value: undefined };
                }
            },
        };
    }

    /**
     * Gets the collection of templates.
     *
     * @returns A reference to the internal list of collection templates.
     */
    toArray(): Template[] {
        return this.items;
    }

    /**
     * Appends 1 or more templates to the collection.
     *
     * @param args List of templates to add.
     */
    push(...args: Template[]): void {
        args.forEach((t) => this.items.push(t));
    }

    /**
     * Gets the evluation options for the current LG file.
     *
     *  @returns A value indicating whether the options when evaluating LG templates.
     */
    get lgOptions(): EvaluationOptions {
        return new EvaluationOptions(this.options);
    }

    /**
     * Gets the namespace to register for the current LG file.
     *
     *  @returns A string value representing the namespace to register for the current LG file.
     */
    get namespace(): string {
        return this.extractNamespace(this.options);
    }

    /**
     * Gets all templates from current lg file and reference lg files.
     *
     * @returns All templates from current lg file and reference lg files.
     */
    get allTemplates(): Template[] {
        let result = this.items;
        this.references.forEach((ref): Template[] => (result = result.concat(ref.items)));
        return Array.from(new Set(result));
    }

    /**
     * Gets all diagnostics from current lg file and reference lg files.
     *
     * @returns All diagnostics from current lg file and reference lg files.
     */
    get allDiagnostics(): Diagnostic[] {
        let result = this.diagnostics;
        this.references.forEach((ref): Diagnostic[] => (result = result.concat(ref.diagnostics)));
        return Array.from(new Set(result));
    }

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
        return TemplatesParser.parseFile(filePath, importResolver, expressionParser).injectToExpressionFunction();
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
        return TemplatesParser.parseText(content, id, importResolver, expressionParser).injectToExpressionFunction();
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
        return TemplatesParser.parseResource(resource, importResolver, expressionParser).injectToExpressionFunction();
    }

    /**
     * Evaluate a template with given name and scope.
     *
     * @param templateName Template name to be evaluated.
     * @param scope The state visible in the evaluation.
     * @param opt EvaluationOptions in evaluating a template.
     * @returns Evaluate result.
     */
    evaluate(templateName: string, scope?: object, opt: EvaluationOptions = undefined): any {
        this.checkErrors();

        const evalOpt = opt !== undefined ? opt.merge(this.lgOptions) : this.lgOptions;
        const evaluator = new Evaluator(this, evalOpt);
        let result = evaluator.evaluateTemplate(templateName, scope);
        if (evalOpt.LineBreakStyle === LGLineBreakStyle.Markdown && typeof result === 'string') {
            result = result.replace(this.newLineRegex, '$1$1');
        }

        return result;
    }

    /**
     * Expand a template with given name and scope.
     * Return all possible responses instead of random one.
     *
     * @param templateName Template name to be evaluated.
     * @param scope The state visible in the evaluation.
     * @param opt EvaluationOptions in expanding a template.
     * @returns Expand result.
     */
    expandTemplate(templateName: string, scope?: object, opt: EvaluationOptions = undefined): any[] {
        this.checkErrors();

        const evalOpt = opt !== undefined ? opt.merge(this.lgOptions) : this.lgOptions;
        const expander = new Expander(this, evalOpt);
        return expander.expandTemplate(templateName, scope);
    }

    /**
     * Analyze a template to get the static analyzer results including variables and template references.
     *
     * @param templateName Template name to be evaluated.
     * @param analyzerOptions Options for analyzing template.
     * @returns Analyzer result.
     */
    analyzeTemplate(templateName: string, analyzerOptions?: AnalyzerOptions): AnalyzerResult {
        this.checkErrors();

        const analyzer = new Analyzer(this, this.lgOptions, analyzerOptions);
        return analyzer.analyzeTemplate(templateName);
    }

    /**
     * Use to evaluate an inline template str.
     *
     * @param inlineStr Inline string which will be evaluated.
     * @param scope Scope object or JToken.
     * @param opt EvaluationOptions in evaluating a template.
     * @returns Evaluated result object.
     */
    evaluateText(inlineStr: string, scope?: object, opt: EvaluationOptions = undefined): any {
        if (inlineStr === undefined) {
            throw Error('inline string is empty');
        }

        this.checkErrors();

        const inlineTemplateId = `${Templates.inlineTemplateIdPrefix}${this.getRandomTemplateId()}`;

        // wrap inline string with "# name and -" to align the evaluation process
        const multiLineMark = '```';

        inlineStr =
            !inlineStr.trim().startsWith(multiLineMark) && inlineStr.includes('\n')
                ? `${multiLineMark}${inlineStr}${multiLineMark}`
                : inlineStr;

        const newContent = `#${inlineTemplateId} ${this.newLine} - ${inlineStr}`;

        const newTemplates = TemplatesParser.parseTextWithRef(newContent, this);
        const evalOpt = opt !== undefined ? opt.merge(this.lgOptions) : this.lgOptions;
        return newTemplates.evaluate(inlineTemplateId, scope, evalOpt);
    }

    /**
     * Update a template and return LG file.
     *
     * @param templateName Orignial template name.
     * @param newTemplateName New template name.
     * @param parameters New params.
     * @param templateBody New template body.
     * @returns New lg file.
     */
    updateTemplate(
        templateName: string,
        newTemplateName: string,
        parameters: string[],
        templateBody: string
    ): Templates {
        const template: Template = this.items.find((u: Template): boolean => u.name === templateName);
        if (template) {
            this.clearDiagnostic();

            const templateNameLine: string = this.buildTemplateNameLine(newTemplateName, parameters);
            const newTemplateBody: string = this.convertTemplateBody(templateBody);
            const content = `${templateNameLine}${this.newLine}${newTemplateBody}`;

            // update content
            this.content = this.replaceRangeContent(
                this.content,
                template.sourceRange.range.start.line - 1,
                template.sourceRange.range.end.line - 1,
                content
            );

            let updatedTemplates = new Templates();
            updatedTemplates.id = this.id;
            updatedTemplates.expressionParser = this.expressionParser;
            updatedTemplates.importResolver = this.importResolver;
            updatedTemplates.namedReferences = this.namedReferences;

            const resource = new LGResource(this.id, this.id, content);
            updatedTemplates = new TemplatesTransformer(updatedTemplates).transform(
                TemplatesParser.antlrParseTemplates(resource)
            );

            const originalStartLine = template.sourceRange.range.start.line - 1;
            this.appendDiagnosticWithOffset(updatedTemplates.diagnostics, originalStartLine);

            if (updatedTemplates.toArray().length > 0) {
                const newTemplate = this.recomputeSourceRange(updatedTemplates.toArray()[0], content);

                this.adjustRangeForUpdateTemplate(template, newTemplate);
                new StaticChecker(this).check().forEach((u): number => this.diagnostics.push(u));
            }
        }

        return this;
    }

    /**
     * Add a new template and return LG file.
     *
     * @param templateName New template name.
     * @param parameters New params.
     * @param templateBody New  template body.
     * @returns New lg file.
     */
    addTemplate(templateName: string, parameters: string[], templateBody: string): Templates {
        const template: Template = this.items.find((u: Template): boolean => u.name === templateName);
        if (template) {
            throw new Error(TemplateErrors.templateExist(templateName));
        }

        this.clearDiagnostic();

        const templateNameLine: string = this.buildTemplateNameLine(templateName, parameters);
        const newTemplateBody: string = this.convertTemplateBody(templateBody);
        const content = `${templateNameLine}${this.newLine}${newTemplateBody}`;
        const originalStartLine = TemplateExtensions.readLine(this.content).length;

        // update content
        this.content = `${this.content}${this.newLine}${templateNameLine}${this.newLine}${newTemplateBody}`;
        let updatedTemplates = new Templates();
        updatedTemplates.id = this.id;
        updatedTemplates.expressionParser = this.expressionParser;
        updatedTemplates.importResolver = this.importResolver;
        updatedTemplates.namedReferences = this.namedReferences;

        const resource = new LGResource(this.id, this.id, content);
        updatedTemplates = new TemplatesTransformer(updatedTemplates).transform(
            TemplatesParser.antlrParseTemplates(resource)
        );

        this.appendDiagnosticWithOffset(updatedTemplates.diagnostics, originalStartLine);

        if (updatedTemplates.toArray().length > 0) {
            const newTemplate = this.recomputeSourceRange(updatedTemplates.toArray()[0], content);
            this.adjustRangeForAddTemplate(newTemplate, originalStartLine);

            // adjust the last template's range when adding the template
            if (this.items.length > 0) {
                this.items[this.items.length - 1].sourceRange.range.end.line =
                    newTemplate.sourceRange.range.start.line - 1;
            }

            this.items.push(newTemplate);
            new StaticChecker(this).check().forEach((u): number => this.diagnostics.push(u));
        }

        return this;
    }

    /**
     * Delete an exist template.
     *
     * @param templateName Which template should delete.
     * @returns Return the new lg file.
     */
    deleteTemplate(templateName: string): Templates {
        const templateIndex = this.items.findIndex((u: Template): boolean => u.name === templateName);
        if (templateIndex >= 0) {
            const template = this.items[templateIndex];
            this.clearDiagnostic();

            const startLine = template.sourceRange.range.start.line - 1;
            const stopLine = template.sourceRange.range.end.line - 1;
            this.content = this.replaceRangeContent(this.content, startLine, stopLine, undefined);
            this.adjustRangeForDeleteTemplate(template);
            this.items.splice(templateIndex, 1);
            new StaticChecker(this).check().forEach((u): number => this.diagnostics.push(u));
        }

        return this;
    }

    /**
     * Returns a string representation of a [Templates](xref:botbuilder-lg.Templates) content.
     *
     * @returns A string representation of a [Templates](xref:botbuilder-lg.Templates) content.
     */
    toString(): string {
        return this.content;
    }

    /**
     * @private
     */
    private getRandomTemplateId(): string {
        return uuidv4().split('-').join('');
    }

    /**
     * @private
     */
    private appendDiagnosticWithOffset(diagnostics: Diagnostic[], offset: number): void {
        if (diagnostics) {
            diagnostics.forEach((u): void => {
                u.range.start.line += offset;
                u.range.end.line += offset;
                this.diagnostics.push(u);
            });
        }
    }

    /**
     * @private
     */
    private adjustRangeForUpdateTemplate(oldTemplate: Template, newTemplate: Template): void {
        const newRange = newTemplate.sourceRange.range.end.line - newTemplate.sourceRange.range.start.line;
        const oldRange = oldTemplate.sourceRange.range.end.line - oldTemplate.sourceRange.range.start.line;

        const lineOffset = newRange - oldRange;

        let hasFound = false;
        for (let i = 0; i < this.items.length; i++) {
            if (hasFound) {
                this.items[i].sourceRange.range.start.line += lineOffset;
                this.items[i].sourceRange.range.end.line += lineOffset;
            } else if (this.items[i].name === oldTemplate.name) {
                hasFound = true;
                newTemplate.sourceRange.range.start.line = oldTemplate.sourceRange.range.start.line;
                newTemplate.sourceRange.range.end.line = oldTemplate.sourceRange.range.end.line + lineOffset;
                this.items[i] = newTemplate;
            }
        }
    }

    /**
     * @private
     */
    private adjustRangeForAddTemplate(newTemplate: Template, lineOffset: number): void {
        const lineLength = newTemplate.sourceRange.range.end.line - newTemplate.sourceRange.range.start.line;
        newTemplate.sourceRange.range.start.line = lineOffset + 1;
        newTemplate.sourceRange.range.end.line = lineOffset + lineLength + 1;
    }

    /**
     * @private
     */
    private adjustRangeForDeleteTemplate(oldTemplate: Template): void {
        const lineOffset = oldTemplate.sourceRange.range.end.line - oldTemplate.sourceRange.range.start.line + 1;

        let hasFound = false;
        for (let i = 0; i < this.items.length; i++) {
            if (hasFound) {
                this.items[i].sourceRange.range.start.line -= lineOffset;
                this.items[i].sourceRange.range.end.line -= lineOffset;
            } else if (this.items[i].name == oldTemplate.name) {
                hasFound = true;
            }
        }
    }

    /**
     * @private
     */
    private clearDiagnostic(): void {
        this.diagnostics = [];
    }

    /**
     * @private
     */
    private replaceRangeContent(
        originString: string,
        startLine: number,
        stopLine: number,
        replaceString: string
    ): string {
        const originList: string[] = TemplateExtensions.readLine(originString);
        if (startLine < 0 || startLine > stopLine || stopLine >= originList.length) {
            throw new Error('index out of range.');
        }

        const destList: string[] = [];
        destList.push(...originList.slice(0, startLine));
        if (replaceString !== undefined && replaceString !== null) {
            destList.push(replaceString);
        }

        destList.push(...originList.slice(stopLine + 1));

        return destList.join(this.newLine);
    }

    /**
     * @private
     */
    private convertTemplateBody(templateBody: string): string {
        if (!templateBody) {
            return '';
        }

        const replaceList: string[] = TemplateExtensions.readLine(templateBody);
        const destList: string[] = replaceList.map((u: string): string => {
            return u.trimLeft().startsWith('#') ? `- ${u.trimLeft()}` : u;
        });

        return destList.join(this.newLine);
    }

    /**
     * @private
     * Compute LG SourceRange based on content instead of parsed token.
     * */
    private recomputeSourceRange(template: Template, content: string): Template {
        if (content != null) {
            const contentList: string[] = TemplateExtensions.readLine(content);
            template.sourceRange.range.start.line = 1;
            template.sourceRange.range.end.line = contentList.length;
        }

        return template;
    }

    /**
     * @private
     */
    private buildTemplateNameLine(templateName: string, parameters: string[]): string {
        // if parameters is null or undefined, ignore ()
        if (parameters === undefined || parameters === undefined) {
            return `# ${templateName}`;
        } else {
            return `# ${templateName}(${parameters.join(', ')})`;
        }
    }

    /**
     * @private
     */
    private checkErrors(): void {
        if (this.allDiagnostics) {
            const errors = this.allDiagnostics.filter((u): boolean => u.severity === DiagnosticSeverity.Error);
            if (errors.length !== 0) {
                throw Error(errors.join(this.newLine));
            }
        }
    }

    /**
     * @private
     */
    private injectToExpressionFunction(): Templates {
        const totalTemplates = [this as Templates].concat(this.references);
        for (const curTemplates of totalTemplates) {
            const globalFuncs = curTemplates.getGlobalFunctionTable(curTemplates.options);
            for (const templateName of globalFuncs) {
                if (curTemplates.items.find((u) => u.name === templateName) !== undefined) {
                    const prefix =
                        !curTemplates.namespace || !curTemplates.namespace.trim() ? '' : curTemplates.namespace + '.';

                    const newGlobalName = prefix + templateName;
                    Expression.functions.add(
                        newGlobalName,
                        new ExpressionEvaluator(
                            newGlobalName,
                            (expr, state, options): ValueWithError => {
                                let value: unknown;
                                let error: string;
                                let args: unknown[];
                                const evaluator = new Evaluator(this, this.lgOptions);
                                // eslint-disable-next-line prefer-const
                                ({ args, error } = FunctionUtils.evaluateChildren(expr, state, options));
                                if (!error) {
                                    const parameters = evaluator.templateMap[templateName].parameters;
                                    const newScope: Record<string, unknown> = {};
                                    parameters.map((e: string, i: number) => (newScope[e] = args[i]));
                                    const scope = new CustomizedMemory(state, new SimpleObjectMemory(newScope));
                                    try {
                                        value = evaluator.evaluateTemplate(templateName, scope);
                                    } catch (e) {
                                        error = e.message;
                                    }
                                }

                                return { value, error };
                            },
                            ReturnType.Object
                        )
                    );
                }
            }
        }
        return this;
    }

    /**
     * @private
     */
    private extractOptionByKey(nameOfKey: string, options: string[]): string {
        let result: string = undefined;
        for (const option of options) {
            if (nameOfKey && option.includes('=')) {
                const index = option.indexOf('=');
                const key = option.substring(0, index).trim().toLowerCase();
                const value = option.substring(index + 1).trim();
                if (key === nameOfKey) {
                    result = value;
                }
            }
        }

        return result;
    }

    /**
     * @private
     */
    private extractNamespace(options: string[]): string {
        let result = this.extractOptionByKey(this.namespaceKey, options);
        if (!result) {
            result = basename(this.id || '').split('.')[0];
        }

        return result;
    }

    /**
     * @private
     */
    private getGlobalFunctionTable(options: string[]): string[] {
        const result: string[] = [];
        const value = this.extractOptionByKey(this.exportsKey, options);
        if (value) {
            const templateList = value.split(',');
            templateList.forEach((u) => {
                result.push(u.trim());
            });
        }

        return result;
    }
}
