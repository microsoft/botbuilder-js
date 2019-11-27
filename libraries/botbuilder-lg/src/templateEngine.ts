/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ExpressionEngine, Extensions } from 'botframework-expressions';
import * as fs from 'fs';
import * as path from 'path';
import { Analyzer, AnalyzerResult } from './analyzer';
import { Diagnostic, DiagnosticSeverity } from './diagnostic';
import { Evaluator } from './evaluator';
import { Expander } from './expander';
import { ImportResolver, ImportResolverDelegate } from './importResolver';
import { LGParser } from './lgParser';
import { LGResource } from './lgResource';
import { LGTemplate } from './lgTemplate';
import { MemoryInterface } from 'botframework-expressions';
import { StaticChecker } from './staticChecker';
import { CustomizedMemory } from './customizedMemory';

/**
 * LG parser and evaluation engine
 */
export class TemplateEngine {

    public templates: LGTemplate[];
    private readonly expressionEngine: ExpressionEngine;

    public constructor(expressionEngine?: ExpressionEngine) {
        this.templates = [];
        this.expressionEngine = expressionEngine !== undefined ? expressionEngine : new ExpressionEngine();
    }

    /**
     * Load .lg files into template engine.
     * You can add one file, or mutlple file as once
     * If you have multiple files referencing each other, make sure you add them all at once,
     * otherwise static checking won't allow you to add it one by one.
     * @memberof TemplateEngine
     * @param importResolver resolver to resolve LG import id to template text.
     * @param filePaths Paths to .lg files.
     * @returns Teamplate engine with parsed files.
     */
    public addFiles = (filePaths: string[], importResolver?: ImportResolverDelegate): TemplateEngine => {
        let totalLGResources: LGResource[] = [];
        filePaths.forEach((filePath: string): void => {
            filePath = path.normalize(ImportResolver.normalizePath(filePath));
            const rootResource: LGResource = LGParser.parse(fs.readFileSync(filePath, 'utf-8'), filePath);
            const lgResources: LGResource[] = rootResource.discoverLGResources(importResolver);
            totalLGResources = totalLGResources.concat(lgResources);
        });

        // Remove duplicated lg files by id
        const deduplicatedLGResources: LGResource[] = totalLGResources.filter((resource: LGResource, index: number, self: LGResource[]): boolean =>
            index === self.findIndex((t: LGResource): boolean => (
                t.id === resource.id
            ))
        );

        const lgTemplates: LGTemplate[] = deduplicatedLGResources.reduce((acc: LGTemplate[], x: LGResource): any =>
            acc = acc.concat(x.templates),                               []
        );

        this.templates = this.templates.concat(lgTemplates);
        this.runStaticCheck(this.templates);

        return this;
    }

    /**
     * Load single .lg file into template engine.
     * @param filePath Path to .lg file.
     * @param importResolver resolver to resolve LG import id to template text.
     * @returns Teamplate engine with single parsed file.
     */
    public addFile = (filePath: string, importResolver?: ImportResolverDelegate): TemplateEngine =>
        this.addFiles([filePath], importResolver)

    /**
     * Add text as lg file content to template engine. A fullpath id is needed when importResolver is empty, or simply pass in customized importResolver.
     * @param content Text content contains lg templates.
     * @param id is the content identifier. If importResolver is null, id should must be a full path string.
     * @param importResolver resolver to resolve LG import id to template text.
     * @returns Template engine with the parsed content.
     */
    public addText = (content: string, id?: string, importResolver?: ImportResolverDelegate): TemplateEngine => {
        this.checkImportResolver(id, importResolver);
        const rootResource: LGResource = LGParser.parse(content, id);
        const lgResources: LGResource[] = rootResource.discoverLGResources(importResolver);
        const lgTemplates: LGTemplate[] = lgResources.reduce((acc: LGTemplate[], x: LGResource): any =>
            acc = acc.concat(x.templates),                   []
        );

        this.templates = this.templates.concat(lgTemplates);
        this.runStaticCheck(this.templates);

        return this;
    }

    public evaluateTemplate(templateName: string, scope?: MemoryInterface | any): any {
        if (scope === null || scope === undefined || !Extensions.isMemoryInterface(scope)) {
            scope = new CustomizedMemory(scope);
        }
        const evalutor: Evaluator = new Evaluator(this.templates, this.expressionEngine);
        return evalutor.evaluateTemplate(templateName, scope);
    }

    public expandTemplate(templateName: string, scope?: any): string[] {
        const expander: Expander = new Expander(this.templates, this.expressionEngine);

        return expander.expandTemplate(templateName, new CustomizedMemory(scope));
    }

    public analyzeTemplate(templateName: string): AnalyzerResult {
        const analyzer: Analyzer = new Analyzer(this.templates, this.expressionEngine);

        return analyzer.analyzeTemplate(templateName);
    }

    public evaluate(inlineStr: string, scope?: any): any {
        // wrap inline string with "# name and -" to align the evaluation process
        const fakeTemplateId = '__temp__';
        inlineStr = !inlineStr.trim().startsWith('```') && inlineStr.indexOf('\n') >= 0
            ? '```'.concat(inlineStr).concat('```') : inlineStr;
        const wrappedStr = `# ${ fakeTemplateId } \r\n - ${ inlineStr }`;
        const lgResource: LGResource = LGParser.parse(wrappedStr, 'inline');
        const mergedTemplates: LGTemplate[] = this.templates.concat(lgResource.templates);
        this.runStaticCheck(mergedTemplates);
        const evalutor: Evaluator = new Evaluator(mergedTemplates, this.expressionEngine);

        return evalutor.evaluateTemplate(fakeTemplateId, new CustomizedMemory(scope));
    }

    private readonly runStaticCheck = (templates: LGTemplate[]): void => {
        const templatesToCheck: LGTemplate[] = templates === undefined ? this.templates : templates;
        const diagnostics: Diagnostic[] = new StaticChecker(this.expressionEngine).checkTemplates(templatesToCheck);

        const errors: Diagnostic[] = diagnostics.filter((u: Diagnostic): boolean => u.severity === DiagnosticSeverity.Error);
        if (errors.length > 0) {
            throw new Error(errors.map((error: Diagnostic): string => error.toString()).join('\n'));
        }
    }

    private checkImportResolver(id: string, importResolver: ImportResolverDelegate): void {
        // Currently if no resolver is passed into AddText(),
        // the default fileResolver is used to resolve the imports.
        // default fileResolver require resource id should be fullPath,
        // so that it can resolve relative path based on this fullPath.
        // But we didn't check the id provided with AddText is fullPath or not.
        // So when id != fullPath, fileResolver won't work.
        if (importResolver === undefined) {
            const importPath: string = ImportResolver.normalizePath(id);
            if (!path.isAbsolute(importPath)) {
                throw new Error('[Error] id must be full path when importResolver is empty');
            }
        }
    }
}
