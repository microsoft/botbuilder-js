/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Template } from './template';
import { TemplateImport } from './templateImport';
import { Diagnostic, DiagnosticSeverity } from './diagnostic';
import { ExpressionParser } from 'adaptive-expressions';
import { ImportResolverDelegate } from './templateParser';
import { Evaluator } from './evaluator';
import { Expander } from './expander';
import { Analyzer } from './analyzer';
import { TemplateParser } from './templateParser';
import { AnalyzerResult } from './analyzerResult';
import { TemplateErrors } from './templateErrors';
import { TemplateExtensions } from './templateExtensions';

/**
 * LG entrance, including properties that LG file has, and evaluate functions.
 */
export class Templates implements Iterable<Template> {
    private items: Template[];

    /**
     * import elements that this LG file contains directly.
     */
    public imports: TemplateImport[];

    /**
     * diagnostics.
     */
    public diagnostics: Diagnostic[];

    /**
     * all references that this LG file has from Imports
     * otice: reference includs all child imports from the lg file,
     * not only the children belong to this lgfile directly.
     * so, reference count may >= imports count.
     */
    public references: Templates[];

    /**
     * LG content.
     */
    public content: string;

    /**
     * id of this lg source. For file, is full path.
     */
    public id: string;

    /**
     * expression parser.
     */
    public expressionParser: ExpressionParser;

    /**
     * Delegate for resolving resource id of imported lg file.
     */
    public importResolver: ImportResolverDelegate;

    /**
     * LG file options.
     */
    public options: string[];

    public constructor(items?: Template[],
        imports?: TemplateImport[],
        diagnostics?: Diagnostic[],
        references?: Templates[],
        content?: string,
        id?: string,
        expressionParser?: ExpressionParser,
        importResolverDelegate?: ImportResolverDelegate,
        options?: string[]) {
        this.items = items || [];
        this.imports = imports || [];
        this.diagnostics = diagnostics || [];
        this.references = references || [];
        this.content = content || '';
        this.id = id || '';
        this.expressionParser = expressionParser || new ExpressionParser();
        this.importResolver = importResolverDelegate;
        this.options = options || [];
    }

    /**
     * Returns a new iterator for the template collection.
     */
    public [Symbol.iterator](): Iterator<Template> {
        let index = 0;
        return {
            next: (): IteratorResult<Template> => {
                if (index < this.items.length) {
                    return { done: false, value: this.items[index++] };
                } else {
                    return { done: true, value: undefined };
                }
            }
        }
    }

    /**
     * Returns a reference to the internal list of collection templates.
     */
    public toArray(): Template[] {
        return this.items;
    }

    /**
     * Appends 1 or more templates to the collection.
     * @param args List of templates to add.
     */
    public push(...args: Template[]): void {
        args.forEach(t => this.items.push(t));
    }

    /**
     * A value indicating whether lG parser/checker/evaluate strict mode.
     * If strict mode is on, expression would throw exception instead of return
     * null or make the condition failed.
     */
    public get strictMode(): boolean {
        return this.getStrictModeFromOptions(this.options);
    }

    /**
     * All templates from current lg file and reference lg files.
     */
    public get allTemplates(): Template[] {
        let result = this.items;
        this.references.forEach((ref): Template[] => result = result.concat(ref.items));
        return Array.from(new Set(result));
    }

    /**
     * All diagnostics from current lg file and reference lg files.
     */
    public get allDiagnostics(): Diagnostic[] {
        let result = this.diagnostics;
        this.references.forEach((ref): Diagnostic[] => result = result.concat(ref.diagnostics));
        return Array.from(new Set(result));
    }


    /**
    * parse a file and return LG file.
    * @param filePath LG absolute file path..
    * @param importResolver resolver to resolve LG import id to template text.
    * @param expressionParser Expression parser for evaluating expressions.
    * @returns new lg file.
    */
    public static parseFile(filePath: string, importResolver?: ImportResolverDelegate, expressionParser?: ExpressionParser): Templates {
        return TemplateParser.parseFile(filePath, importResolver, expressionParser);
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
        return TemplateParser.parseText(content, id, importResolver, expressionParser);
    }

    /**
     * Evaluate a template with given name and scope.
     * @param templateName Template name to be evaluated.
     * @param scope The state visible in the evaluation.
     * @returns Evaluate result.
     */
    public evaluate(templateName: string, scope?: object): any {
        this.checkErrors();

        const evaluator = new Evaluator(this.allTemplates, this.expressionParser, this.strictMode);
        return evaluator.evaluateTemplate(templateName, scope);
    }

    /**
     * Expand a template with given name and scope.
     * Return all possible responses instead of random one.
     * @param templateName Template name to be evaluated.
     * @param scope The state visible in the evaluation.
     * @returns Expand result.
     */
    public expandTemplate(templateName: string, scope?: object): string[] {
        this.checkErrors();

        const expander = new Expander(this.allTemplates, this.expressionParser, this.strictMode);
        return expander.expandTemplate(templateName, scope);
    }

    /**
     * Analyzer a template to get the static analyzer results including variables and template references.
     * @param templateName Template name to be evaluated.
     * @returns analyzer result.
     */
    public analyzeTemplate(templateName: string): AnalyzerResult {
        this.checkErrors();

        const analyzer = new Analyzer(this.allTemplates, this.expressionParser);
        return analyzer.analyzeTemplate(templateName);
    }

    /**
     * Use to evaluate an inline template str.
     * @param inlineStr inline string which will be evaluated.
     * @param scope scope object or JToken.
     */
    public evaluateText(inlineStr: string, scope?: object): any
    {
        if (inlineStr === undefined)
        {
            throw Error('inline string is empty');
        }

        this.checkErrors();

        // wrap inline string with "# name and -" to align the evaluation process
        const fakeTemplateId = TemplateExtensions.newGuid();
        const multiLineMark = '```';

        inlineStr = !(inlineStr.trim().startsWith(multiLineMark) && inlineStr.includes('\n'))
            ? `${ multiLineMark }${ inlineStr }${ multiLineMark }` : inlineStr;

        const newContent = `#${ fakeTemplateId } \r\n - ${ inlineStr }`;

        const newTemplates = TemplateParser.parseTextWithRef(newContent, this);
        return newTemplates.evaluate(fakeTemplateId, scope);
    }

    /**
    * Update a template and return LG file.
    * @param templateName new template name.
    * @param parameters new params.
    * @param templateBody new  template body.
    * @returns new lg file.
    */
    public updateTemplate(templateName: string, newTemplateName: string, parameters: string[], templateBody: string): Templates {
        const template: Template = this.items.find((u: Template): boolean => u.name === templateName);
        if (template === undefined) {
            return this;
        }

        const templateNameLine: string = this.buildTemplateNameLine(newTemplateName, parameters);
        const newTemplateBody: string = this.convertTemplateBody(templateBody);
        const content = `${ templateNameLine }\r\n${ newTemplateBody }\r\n`;

        let startLine: number;
        let stopLine: number;

        ({startLine, stopLine} = template.getTemplateRange());
        const newContent: string = this.replaceRangeContent(this.content, startLine, stopLine, content);
        this.initialize(TemplateParser.parseText(newContent, this.id, this.importResolver));

        return this;
    }

    /**
    * Add a new template and return LG file.
    * @param templateName new template name.
    * @param parameters new params.
    * @param templateBody new  template body.
    * @returns new lg file.
    */
    public addTemplate(templateName: string, parameters: string[], templateBody: string): Templates {
        const template: Template = this.items.find((u: Template): boolean => u.name === templateName);
        if (template !== undefined) {
            throw new Error(TemplateErrors.templateExist(templateName));
        }

        const templateNameLine: string = this.buildTemplateNameLine(templateName, parameters);
        const newTemplateBody: string = this.convertTemplateBody(templateBody);
        const newContent = `${ this.content.trimRight() }\r\n\r\n${ templateNameLine }\r\n${ newTemplateBody }\r\n`;
        this.initialize(TemplateParser.parseText(newContent, this.id, this.importResolver));

        return this;
    }

    /**
    * Delete an exist template.
    * @param templateName which template should delete.
    * @returns return the new lg file.
    */
    public deleteTemplate(templateName: string): Templates {
        const template: Template = this.items.find((u: Template): boolean => u.name === templateName);
        if (template === undefined) {
            return this;
        }

        let startLine: number;
        let stopLine: number;

        ({startLine, stopLine} = template.getTemplateRange());

        const newContent: string = this.replaceRangeContent(this.content, startLine, stopLine, undefined);
        this.initialize(TemplateParser.parseText(newContent, this.id, this.importResolver));

        return this;
    }

    public toString(): string {
        return this.content;
    }

    private replaceRangeContent(originString: string, startLine: number, stopLine: number, replaceString: string): string {
        const originList: string[] = originString.split('\n');
        const destList: string[] = [];

        if (startLine < 0 || startLine > stopLine || stopLine >= originList.length) {
            throw new Error('index out of range.');
        }

        destList.push(...this.trimList(originList.slice(0, startLine)));

        if (stopLine < originList.length - 1) {
            // insert at the middle of the content
            destList.push('\r\n');
            if (replaceString) {
                destList.push(replaceString);
                destList.push('\r\n');
            }

            destList.push(...this.trimList(originList.slice(stopLine + 1)));
        } else {
            // insert at the tail of the content
            if (replaceString) {
                destList.push('\r\n');
                destList.push(replaceString);
            }
        }

        return this.buildNewLGContent(this.trimList(destList));
    }

    /**
     * trim the newlines at the beginning or at the tail of the array
     * @param input input array
     */
    private trimList(input: string[]): string[] {
        if (input === undefined) {
            return undefined;
        }

        let startIndex = 0;
        let endIndex = input.length;

        for(let i = 0; i< input.length; i++) {
            if (input[i].trim() !== '') {
                startIndex = i;
                break;
            }
        }

        for(let i = input.length - 1; i >= 0; i--) {
            if (input[i].trim() !== '') {
                endIndex = i + 1;
                break;
            }
        }

        return input.slice(startIndex, endIndex);
    }

    private buildNewLGContent(destList: string[]): string {
        let result = '';
        for (let i = 0; i < destList.length; i++) {
            const currentItem: string = destList[i];
            result = result.concat(currentItem);
            if (currentItem.endsWith('\r')) {
                result = result.concat('\n');
            } else if (i < destList.length - 1 && !currentItem.endsWith('\r\n')) {
                result = result.concat('\r\n');
            }
        }

        return result;
    }

    private convertTemplateBody(templateBody: string): string {
        if (!templateBody) {
            return '';
        }

        const replaceList: string[] = templateBody.split('\n');
        const wrappedReplaceList: string[] = replaceList.map((u: string): string => this.wrapTemplateBodyString(u));

        return wrappedReplaceList.join('\n');
    }

    private wrapTemplateBodyString(replaceItem: string): string {
        const isStartWithHash: boolean = replaceItem.trimLeft().startsWith('#');
        if (isStartWithHash) {
            return `- ${ replaceItem.trimLeft() }`;
        } else {
            return replaceItem;
        }
    }

    private buildTemplateNameLine(templateName: string, parameters: string[]): string {
        // if parameters is null or undefined, ignore ()
        if (parameters === undefined || parameters === undefined) {
            return `# ${ templateName }`;
        } else {
            return `# ${ templateName }(${ parameters.join(', ') })`;
        }
    }

    private initialize(templates: Templates): void {
        this.items = templates.items;
        this.imports = templates.imports;
        this.diagnostics = templates.diagnostics;
        this.references = templates.references;
        this.content = templates.content;
        this.importResolver = templates.importResolver;
        this.id = templates.id;
        this.expressionParser = templates.expressionParser;
        this.options = templates.options;
    }

    private checkErrors(): void {
        if (this.allDiagnostics) {
            const errors = this.allDiagnostics.filter((u): boolean => u.severity === DiagnosticSeverity.Error);
            if (errors.length !== 0) {
                throw Error(errors.join('\n'));
            }
        }
    }

    private getStrictModeFromOptions(options: string[]): boolean {
        let result = false;
        if (!options)
        {
            return result;
        }

        const strictModeKey = '@strict';
        for (const option of options)
        {
            if (option && option.includes('=')) {
                const index = option.indexOf('=');
                const key = option.substring(0, index).trim();
                const value = option.substring(index + 1).trim().toLowerCase();
                if (key === strictModeKey)
                {
                    if (value === 'true')
                    {
                        result = true;
                    }
                    else if (value == 'false')
                    {
                        result = false;
                    }
                }
            }
        }

        return result;
    }
}