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
import { Expander } from './expander';
import { IGetMethod } from './getMethodExtensions';
import { ImportResolver, ImportResolverDelegate } from './importResolver';
import { LGParser } from './lgParser';
import { LGResource } from './lgResource';
import { LGTemplate } from './lgTemplate';
import { StaticChecker } from './staticChecker';

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
            filePath = path.normalize(filePath.replace('\\','/'));
            const rootResource: LGResource = LGParser.parse(fs.readFileSync(filePath, 'utf-8'), filePath);
            const lgResources: LGResource[] = rootResource.discoverLGResources(importResolver);
            totalLGResources = totalLGResources.concat(lgResources);
        });

        // Remove duplicated lg files by id
        const deduplicatedLGResources: LGResource[] = totalLGResources.filter((resource: LGResource, index: number, self: LGResource[]) =>
            index === self.findIndex((t: LGResource) => (
                t.Id === resource.Id
            ))
        );

        const lgTemplates: LGTemplate[] = deduplicatedLGResources.reduce((acc: LGTemplate[], x: LGResource) =>
            acc = acc.concat(x.Templates),                               []
        );

        this.templates = this.templates.concat(lgTemplates);
        this.runStaticCheck(this.templates);

        return this;
    }

    public addFile = (filePath: string, importResolver?: ImportResolverDelegate): TemplateEngine =>
        this.addFiles([filePath], importResolver)

    public addText = (content: string, name: string, importResolver: ImportResolverDelegate): TemplateEngine => {
        const rootResource: LGResource = LGParser.parse(content, name);
        const lgResources: LGResource[] = rootResource.discoverLGResources(importResolver);
        const lgTemplates: LGTemplate[] = lgResources.reduce((acc: LGTemplate[], x: LGResource) =>
            acc = acc.concat(x.Templates),                   []
        );

        this.templates = this.templates.concat(lgTemplates);
        this.runStaticCheck(this.templates);

        return this;
    }

    public evaluateTemplate(templateName: string, scope?: any, methodBinder?: IGetMethod) : string {
        const evalutor: Evaluator = new Evaluator(this.templates, methodBinder);

        return evalutor.EvaluateTemplate(templateName, scope);
    }

    public expandTemplate(templateName: string, scope?: any, methodBinder?: IGetMethod) : string[] {
        const expander: Expander = new Expander(this.templates, methodBinder);

        return expander.ExpandTemplate(templateName, scope);
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
        const lgResource: LGResource = LGParser.parse(wrappedStr, 'inline');
        const mergedTemplates: LGTemplate[] = this.templates.concat(lgResource.Templates);
        this.runStaticCheck(mergedTemplates);
        const evalutor: Evaluator = new Evaluator(mergedTemplates, methodBinder);

        return evalutor.EvaluateTemplate(fakeTemplateId, scope);
    }

    private readonly runStaticCheck = (templates: LGTemplate[]): void => {
        const teamplatesToCheck: LGTemplate[] = templates === undefined ? this.templates : templates;
        const diagnostics: Diagnostic[] = StaticChecker.checkTemplates(teamplatesToCheck);

        const errors: Diagnostic[] = diagnostics.filter((u: Diagnostic) => u.Severity === DiagnosticSeverity.Error);
        if (errors.length > 0) {
            throw new Error(errors.map((error: Diagnostic) => error.toString()).join('\n'));
        }
    }
}
