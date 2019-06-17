/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import * as fs from 'fs';
import { flatten } from 'lodash';
import { Analyzer } from './analyzer';
import { Diagnostic, DiagnosticSeverity } from './diagnostic';
import { Evaluator } from './evaluator';
import { IGetMethod } from './getMethodExtensions';
import { LGParser } from './lgParser';
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

    public static fromFiles(...filePaths: string[]): TemplateEngine {
        return new TemplateEngine().addFiles(...filePaths);
    }

    public static fromText(lgFileContent: string): TemplateEngine {
       return new TemplateEngine().addText(lgFileContent);
    }

    public addFiles = (...filePaths: string[]) : TemplateEngine => {
        const newTemplates: LGTemplate[] = flatten(filePaths.map((filePath: string) => {
            // tslint:disable-next-line: non-literal-fs-path
            const text: string = fs.readFileSync(filePath, 'utf-8');

            return LGParser.Parse(text, filePath);
        }));

        const mergedTemplates: LGTemplate[] = this.templates.concat(newTemplates);

        this.runStaticCheck(mergedTemplates);

        this.templates = mergedTemplates;

        return this;
    }

    public addText = (text: string): TemplateEngine => {
        const newTemplates: LGTemplate[] = LGParser.Parse(text, 'text');
        const mergedTemplates: LGTemplate[] = this.templates.concat(newTemplates);

        this.runStaticCheck(mergedTemplates);

        this.templates = mergedTemplates;

        return this;
    }

    public evaluateTemplate(templateName: string, scope?: any, methodBinder?: IGetMethod) : string {
        const evalutor: Evaluator = new Evaluator(this.templates, methodBinder);

        return evalutor.EvaluateTemplate(templateName, scope);
    }

    public analyzeTemplate(templateName: string): string[] {
        const analyzer: Analyzer = new Analyzer(this.templates);

        return analyzer.AnalyzeTemplate(templateName);
    }

    public evaluate(inlineStr: string, scope?: any, methodBinder?: IGetMethod): string {
        // wrap inline string with "# name and -" to align the evaluation process
        const fakeTemplateId: string = '__temp__';
        inlineStr = !inlineStr.trim().startsWith('```') && inlineStr.indexOf('\n') >= 0
                   ? '```'.concat(inlineStr).concat('```') : inlineStr;
        const wrappedStr: string = `# ${fakeTemplateId} \r\n - ${inlineStr}`;

        const newTemplates: LGTemplate[] = LGParser.Parse(wrappedStr, 'inline');
        const mergedTemplates: LGTemplate[] = this.templates.concat(newTemplates);

        this.runStaticCheck(mergedTemplates);

        const evalutor: Evaluator = new Evaluator(mergedTemplates, methodBinder);

        return evalutor.EvaluateTemplate(fakeTemplateId, scope);
    }

    /*
    public AddFiles = (...filePaths: string[]): TemplateEngine => {

    }
    */

    private readonly runStaticCheck = (templates: LGTemplate[]): void => {
        const checker: StaticChecker = new StaticChecker(templates);
        const diagnostics: Diagnostic[] = checker.Check();

        const errors: Diagnostic[] = diagnostics.filter((u: Diagnostic) => u.Severity === DiagnosticSeverity.Error);
        if (errors.length > 0) {
            throw new Error(errors.map((error: Diagnostic) => error.toString()).join('\n'));
        }
    }
}
