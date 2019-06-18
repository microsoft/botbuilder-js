/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as fs from 'fs';
import * as path from 'path';
import { Analyzer, AnalyzerOutputItem } from './analyzer';
import { Diagnostic, DiagnosticSeverity } from './diagnostic';
import { Evaluator } from './evaluator';
import { IGetMethod } from './getMethodExtensions';
import { LGImport } from './LGImport';
import { LGParser } from './lgParser';
import { LGResource } from './LGResource';
import { LGTemplate } from './lgTemplate';
import { StaticChecker } from './staticChecker';

export declare type ImportResolverDelegate = (resourceId: string) => { content: string; absoluteFilePath: string };

/**
 * LG parser and evaluation engine
 */
export class TemplateEngine {

    public templates: LGTemplate[];

    public constructor() {
        this.templates = [];
    }

    public addFiles = (filePaths: string[], importResolver?: ImportResolverDelegate): TemplateEngine => {
        filePaths.forEach((filePath: string) => {
            importResolver = importResolver !== undefined ? importResolver :
                ((id: string): { content: string; absoluteFilePath: string } => {
                    // import paths are in resource files which can be executed on multiple OS environments
                    // Call GetOsPath() to map / & \ in importPath -> OSPath
                    let importPath: string = this.getOsPath(id);
                    if (!path.isAbsolute(importPath)) {
                        // get full path for importPath relative to path which is doing the import.
                        importPath = path.normalize(path.join(path.dirname(filePath), id));
                    }

                    const content: string = fs.readFileSync(importPath, 'utf-8');

                    return { content, absoluteFilePath: importPath };
                });

            filePath = path.normalize(filePath);
            const fileContent: string = fs.readFileSync(filePath, 'utf-8');
            this.addText(fileContent, filePath, importResolver);
        });

        this.runStaticCheck(this.templates);

        return this;
    }

    public addFile = (filePath: string, importResolver?: ImportResolverDelegate): TemplateEngine =>
        this.addFiles([filePath], importResolver)

    public addText = (content: string, name: string, importResolver: ImportResolverDelegate): TemplateEngine => {
        const sources: Map<string, LGResource> = new Map<string, LGResource>();
        this.LoopLGText(content, name, sources, importResolver);
        sources.forEach((s: LGResource) => this.templates = this.templates.concat(s.Templates));
        this.runStaticCheck(this.templates);

        return this;
    }

    public evaluateTemplate(templateName: string, scope?: any, methodBinder?: IGetMethod) : string {
        const evalutor: Evaluator = new Evaluator(this.templates, methodBinder);

        return evalutor.EvaluateTemplate(templateName, scope);
    }

    public analyzeTemplate(templateName: string): AnalyzerOutputItem {
        const analyzer: Analyzer = new Analyzer(this.templates);

        return analyzer.AnalyzeTemplate(templateName);
    }

    public evaluate(inlineStr: string, scope?: any, methodBinder?: IGetMethod): string {
        // wrap inline string with "# name and -" to align the evaluation process
        const fakeTemplateId: string = '__temp__';
        inlineStr = !inlineStr.trim().startsWith('```') && inlineStr.indexOf('\n') >= 0
                   ? '```'.concat(inlineStr).concat('```') : inlineStr;
        const wrappedStr: string = `# ${fakeTemplateId} \r\n - ${inlineStr}`;
        const lgResource: LGResource = LGParser.Parse(wrappedStr, 'inline');
        const mergedTemplates: LGTemplate[] = this.templates.concat(lgResource.Templates);
        this.runStaticCheck(mergedTemplates);
        const evalutor: Evaluator = new Evaluator(mergedTemplates, methodBinder);

        return evalutor.EvaluateTemplate(fakeTemplateId, scope);
    }

    private readonly runStaticCheck = (templates: LGTemplate[]): void => {
        const checker: StaticChecker = new StaticChecker(templates);
        const diagnostics: Diagnostic[] = checker.Check();

        const errors: Diagnostic[] = diagnostics.filter((u: Diagnostic) => u.Severity === DiagnosticSeverity.Error);
        if (errors.length > 0) {
            throw new Error(errors.map((error: Diagnostic) => error.toString()).join('\n'));
        }
    }

    private ImportIds(ids: string[], sources: Map<string, LGResource>, importResolver: ImportResolverDelegate): void {
        if (importResolver === undefined) {
            // default to fileResolver...
            importResolver = this.FileResolver;
        }

        ids.forEach((id: string) => {
            try {
                const {content, absoluteFilePath} = importResolver(id);
                if (!sources.has(absoluteFilePath)) {
                    this.LoopLGText(content, absoluteFilePath, sources, importResolver);
                }
            } catch (e) {
                throw new Error(`${id}:${e.message}`);
            }
        });
    }

    private LoopLGText(content: string, name: string, sources: Map<string, LGResource>, importResolver: ImportResolverDelegate): void {
        const source: LGResource = LGParser.Parse(content, name);
        sources.set(name, source);
        this.ImportIds(source.Imports.map((lg: LGImport) => lg.Id), sources, importResolver);
    }

    private FileResolver = (filePath: string): { content: string; absoluteFilePath: string } => {
        filePath = path.resolve(filePath);

        return { content: fs.readFileSync(filePath, 'utf-8'), absoluteFilePath: filePath };
    }

    private getOsPath(ambigiousPath: string): string {
        if (process.platform === 'win32') {
            return ambigiousPath.replace('/', '\\');
        } else {
            return ambigiousPath.replace('\\', '/');
        }
    }
}
