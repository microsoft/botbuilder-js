/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as fs from 'fs';
import * as path from 'path';
import { Analyzer, AnalyzerResult } from './analyzer';
import { Diagnostic, DiagnosticSeverity } from './diagnostic';
import { Evaluator } from './evaluator';
import { IGetMethod } from './getMethodExtensions';
import { LGImport } from './LGImport';
import { LGParser } from './lgParser';
import { LGResource } from './LGResource';
import { LGTemplate } from './lgTemplate';
import { StaticChecker } from './staticChecker';

/**
 * Delegate for resolving resource id of imported lg file.
 */
export declare type ImportResolverDelegate = (resourceId: string) => { content: string; id: string };

/**
 * LG parser and evaluation engine
 */
export class TemplateEngine {

    public templates: LGTemplate[];

    public constructor() {
        this.templates = [];
    }

    public addFiles = (filePaths: string[], importResolver?: ImportResolverDelegate): TemplateEngine => {
        let totalLGResources: LGResource[] = [];
        filePaths.forEach((filePath: string) => {
            importResolver = importResolver !== undefined ? importResolver :
                ((id: string): { content: string; id: string } => {
                    // import paths are in resource files which can be executed on multiple OS environments
                    // Call GetOsPath() to map / & \ in importPath -> OSPath
                    let importPath: string = this.getOsPath(id);
                    if (!path.isAbsolute(importPath)) {
                        // get full path for importPath relative to path which is doing the import.
                        importPath = path.normalize(path.join(path.dirname(filePath), id));
                    }

                    const content: string = fs.readFileSync(importPath, 'utf-8');

                    return { content, id: importPath };
                });

            filePath = path.normalize(filePath);
            const rootResource: LGResource = LGParser.Parse(fs.readFileSync(filePath, 'utf-8'), filePath);
            const lgResources: LGResource[] = this.discoverLGResources(rootResource, importResolver);
            totalLGResources = totalLGResources.concat(lgResources);
        });

        // Remove duplicated lg files by id
        const deduplicatedLGResources: LGResource[] = totalLGResources.filter((resource: LGResource, index: number, self: LGResource[]) =>
            index === self.findIndex((t: LGResource) => (
                t.Id === resource.Id
            ))
        );

        const lgTemplates: LGTemplate[] = deduplicatedLGResources.reduce((acc: LGTemplate[], x: LGResource) =>
            acc = acc.concat(x.Templates), []
        );

        this.templates = this.templates.concat(lgTemplates);
        this.runStaticCheck(this.templates);

        return this;
    }

    public addFile = (filePath: string, importResolver?: ImportResolverDelegate): TemplateEngine =>
        this.addFiles([filePath], importResolver)

    public addText = (content: string, name: string, importResolver: ImportResolverDelegate): TemplateEngine => {
        const rootResource: LGResource = LGParser.Parse(content, name);
        const lgResources: LGResource[] = this.discoverLGResources(rootResource, importResolver);
        const lgTemplates: LGTemplate[] = lgResources.reduce((acc: LGTemplate[], x: LGResource) =>
            acc = acc.concat(x.Templates), []
        );

        this.templates = this.templates.concat(lgTemplates);
        this.runStaticCheck(this.templates);

        return this;
    }

    public evaluateTemplate(templateName: string, scope?: any, methodBinder?: IGetMethod) : string {
        const evalutor: Evaluator = new Evaluator(this.templates, methodBinder);

        return evalutor.EvaluateTemplate(templateName, scope);
    }

    public analyzeTemplate(templateName: string): AnalyzerResult {
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

    private discoverLGResources(start: LGResource, importResolver: ImportResolverDelegate)
        : LGResource[] {
        const resourcesFound: LGResource[] = [];
        importResolver = importResolver === undefined ? this.fileResolver : importResolver;
        this.resolveImportResources(start, importResolver, resourcesFound);

        return resourcesFound;
    }

    private resolveImportResources(start: LGResource, importResolver: ImportResolverDelegate, resourcesFound: LGResource[]): void {
        const resourceIds: string[] = start.Imports.map((lg: LGImport) => lg.Id);
        resourcesFound.push(start);

        resourceIds.forEach((resourceId: string) => {
            try {
                const { content, id } = importResolver(resourceId);
                const childResource: LGResource = LGParser.Parse(content, id);

                if (!(resourcesFound.some((x: LGResource) => x.Id === childResource.Id))) {
                    this.resolveImportResources(childResource, importResolver, resourcesFound);
                }
            } catch (e) {
                throw new Error(`${resourceId}:${e.message}`);
            }
        });
    }

    private fileResolver = (filePath: string): { content: string; id: string } => {
        filePath = path.resolve(filePath);

        return { content: fs.readFileSync(filePath, 'utf-8'), id: filePath };
    }

    private getOsPath(ambigiousPath: string): string {
        if (process.platform === 'win32') {
            return ambigiousPath.replace('/', '\\');
        } else {
            return ambigiousPath.replace('\\', '/');
        }
    }
}
