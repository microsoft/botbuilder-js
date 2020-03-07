/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { LGTemplate } from './lgTemplate';
import { LGImport } from './lgImport';
import { Diagnostic, DiagnosticSeverity } from './diagnostic';
import { ExpressionParser } from 'adaptive-expressions';
import { ImportResolverDelegate } from './lgParser';
import { Evaluator } from './evaluator';
import { Expander } from './expander';
import { Analyzer } from './analyzer';
import { LGParser } from './lgParser';
import { AnalyzerResult } from './analyzerResult';
import { LGErrors } from './lgErrors';
import { LGExtensions } from './lgExtensions';

/// <summary>
/// LG entrance, including properties that LG file has, and evaluate functions.
/// </summary>
export class LGFile {

    /// <summary>
    /// Gets or sets templates that this LG file contains directly.
    /// </summary>
    /// <value>
    /// templates that this LG file contains directly.
    /// </value>
    public templates: LGTemplate[];

    /// <summary>
    /// Gets or sets import elements that this LG file contains directly.
    /// </summary>
    /// <value>
    /// import elements that this LG file contains directly.
    /// </value>
    public imports: LGImport[];

    /// <summary>
    /// Gets or sets diagnostics.
    /// </summary>
    /// <value>
    /// diagnostics.
    /// </value>
    public diagnostics: Diagnostic[];

    /// <summary>
    /// Gets or sets all references that this LG file has from <see cref="Imports"/>.
    /// Notice: reference includs all child imports from the lg file,
    /// not only the children belong to this lgfile directly.
    /// so, reference count may >= imports count. 
    /// </summary>
    /// <value>
    /// all references that this LG file has from <see cref="Imports"/>.
    /// </value>
    public references: LGFile[];

    /// <summary>
    /// Gets or sets LG content.
    /// </summary>
    /// <value>
    /// LG content.
    /// </value>
    public content: string;

    /// <summary>
    /// Gets or sets id of this LG file.
    /// </summary>
    /// <value>
    /// id of this lg source. For file, is full path.
    /// </value>
    public id: string;

    /// <summary>
    /// Gets or sets expression parser.
    /// </summary>
    /// <value>
    /// expression parser.
    /// </value>
    public expressionParser: ExpressionParser;

    /// <summary>
    /// Gets or sets delegate for resolving resource id of imported lg file.
    /// </summary>
    /// <value>
    /// Delegate for resolving resource id of imported lg file.
    /// </value>
    public importResolver: ImportResolverDelegate;

    /// <summary>
    /// Gets or sets lG file options.
    /// </summary>
    /// <value>
    /// LG file options.
    /// </value>
    public options: string[];

    public constructor(templates?: LGTemplate[],
        imports?: LGImport[],
        diagnostics?: Diagnostic[],
        references?: LGFile[],
        content?: string,
        id?: string,
        expressionParser?: ExpressionParser,
        importResolverDelegate?: ImportResolverDelegate,
        options?: string[]) {
        this.templates = templates || [];
        this.imports = imports || [];
        this.diagnostics = diagnostics || [];
        this.references = references || [];
        this.content = content || '';
        this.id = id || '';
        this.expressionParser = expressionParser || new ExpressionParser();
        this.importResolver = importResolverDelegate;
        this.options = options || [];
    }

    /// <summary>
    /// Gets a value indicating whether lG parser/checker/evaluate strict mode.
    /// If strict mode is on, expression would throw exception instead of return
    /// null or make the condition failed.
    /// </summary>
    /// <value>
    /// A value indicating whether lG parser/checker/evaluate strict mode.
    /// If strict mode is on, expression would throw exception instead of return
    /// null or make the condition failed.
    /// </value>
    public get strictMode(): boolean {
        return this.getStrictModeFromOptions(this.options);
    }

    /// <summary>
    /// Gets get all templates from current lg file and reference lg files.
    /// </summary>
    /// <value>
    /// All templates from current lg file and reference lg files.
    /// </value>
    public get allTemplates(): LGTemplate[] {
        let result = this.templates;
        this.references.forEach((ref): LGTemplate[] => result = result.concat(ref.templates));
        return Array.from(new Set(result));
    }

    /// <summary>
    /// Gets get all diagnostics from current lg file and reference lg files.
    /// </summary>
    /// <value>
    /// All diagnostics from current lg file and reference lg files.
    /// </value>
    public get allDiagnostics(): Diagnostic[] {
        let result = this.diagnostics;
        this.references.forEach((ref): Diagnostic[] => result = result.concat(ref.diagnostics));
        return Array.from(new Set(result));
    }

    /// <summary>
    /// Evaluate a template with given name and scope.
    /// </summary>
    /// <param name="templateName">Template name to be evaluated.</param>
    /// <param name="scope">The state visible in the evaluation.</param>
    /// <returns>Evaluate result.</returns>
    public evaluateTemplate(templateName: string, scope?: object): any {
        this.checkErrors();

        const evaluator = new Evaluator(this.allTemplates, this.expressionParser, this.strictMode);
        return evaluator.evaluateTemplate(templateName, scope);
    }

    /// <summary>
    /// Expand a template with given name and scope.
    /// Return all possible responses instead of random one.
    /// </summary>
    /// <param name="templateName">Template name to be evaluated.</param>
    /// <param name="scope">The state visible in the evaluation.</param>
    /// <returns>Expand result.</returns>
    public expandTemplate(templateName: string, scope?: object): string[] {
        this.checkErrors();

        const expander = new Expander(this.allTemplates, this.expressionParser, this.strictMode);
        return expander.expandTemplate(templateName, scope);
    }

    /// <summary>
    /// (experimental)
    /// Analyzer a template to get the static analyzer results including variables and template references.
    /// </summary>
    /// <param name="templateName">Template name to be evaluated.</param>
    /// <returns>analyzer result.</returns>
    public analyzeTemplate(templateName: string): AnalyzerResult {
        this.checkErrors();

        const analyzer = new Analyzer(this.allTemplates, this.expressionParser);
        return analyzer.analyzeTemplate(templateName);
    }

    /// <summary>
    /// Use to evaluate an inline template str.
    /// </summary>
    /// <param name="inlineStr">inline string which will be evaluated.</param>
    /// <param name="scope">scope object or JToken.</param>
    /// <returns>Evaluate result.</returns>
    public evaluate(inlineStr: string, scope?: object): any
    {
        if (inlineStr === undefined)
        {
            throw Error('inline string is empty');
        }

        this.checkErrors();

        // wrap inline string with "# name and -" to align the evaluation process
        const fakeTemplateId = LGExtensions.newGuid();
        const multiLineMark = '```';

        inlineStr = !(inlineStr.trim().startsWith(multiLineMark) && inlineStr.includes('\n'))
            ? `${ multiLineMark }${ inlineStr }${ multiLineMark }` : inlineStr;

        const newContent = `#${ fakeTemplateId } \r\n - ${ inlineStr }`;

        const newLgFile = LGParser.parseTextWithRef(newContent, this);
        return newLgFile.evaluateTemplate(fakeTemplateId, scope);
    }

    /**
    * Update a template and return LG file.
    * @param templateName new template name.
    * @param parameters new params.
    * @param templateBody new  template body.
    * @returns new lg file.
    */
    public updateTemplate(templateName: string, newTemplateName: string, parameters: string[], templateBody: string): LGFile {
        const template: LGTemplate = this.templates.find((u: LGTemplate): boolean => u.name === templateName);
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
        this.initialize(LGParser.parseText(newContent, this.id, this.importResolver));

        return this;
    }

    /**
    * Add a new template and return LG file.
    * @param templateName new template name.
    * @param parameters new params.
    * @param templateBody new  template body.
    * @returns new lg file.
    */
    public addTemplate(templateName: string, parameters: string[], templateBody: string): LGFile {
        const template: LGTemplate = this.templates.find((u: LGTemplate): boolean => u.name === templateName);
        if (template !== undefined) {
            throw new Error(LGErrors.templateExist(templateName));
        }

        const templateNameLine: string = this.buildTemplateNameLine(templateName, parameters);
        const newTemplateBody: string = this.convertTemplateBody(templateBody);
        const newContent = `${ this.content.trimRight() }\r\n\r\n${ templateNameLine }\r\n${ newTemplateBody }\r\n`;
        this.initialize(LGParser.parseText(newContent, this.id, this.importResolver));

        return this;
    }

    /**
    * Delete an exist template.
    * @param templateName which template should delete.
    * @returns return the new lg file.
    */
    public deleteTemplate(templateName: string): LGFile {
        const template: LGTemplate = this.templates.find((u: LGTemplate): boolean => u.name === templateName);
        if (template === undefined) {
            return this;
        }

        let startLine: number;
        let stopLine: number;

        ({startLine, stopLine} = template.getTemplateRange());

        const newContent: string = this.replaceRangeContent(this.content, startLine, stopLine, undefined);
        this.initialize(LGParser.parseText(newContent, this.id, this.importResolver));

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

    private initialize(lgfile: LGFile): void {
        this.templates = lgfile.templates;
        this.imports = lgfile.imports;
        this.diagnostics = lgfile.diagnostics;
        this.references = lgfile.references;
        this.content = lgfile.content;
        this.importResolver = lgfile.importResolver;
        this.id = lgfile.id;
        this.expressionParser = lgfile.expressionParser;
        this.options = lgfile.options;
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