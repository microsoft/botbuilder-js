/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Analyzer } from './analyzer';
import { Expander, IGetMethod } from './expander';
import { Extractor } from './extractor';
import { LGTemplate } from './lgTemplate';
import { ReportEntry, StaticChecker } from './staticChecker';
import { TemplateEngine } from './templateEngine';

// tslint:disable-next-line: completed-docs
export class MSLGTool {
    public MergerMessages: string[] = [];
    public MergedTemplates: Map<string, any> = new Map<string, any>();
    public NameCollisions: string[] = [];

    private Templates: LGTemplate[];

    public ValidateFile(lgFileContent: string): string[] {
        let errors: string[] = [];
        try {
            this.Templates = this.BuildTemplates(lgFileContent);
            if (this.Templates !== undefined && this.Templates.length > 0) {
                // run static checker to get warning messages
                errors = this.RunStaticCheck(this.Templates);
                this.RunTemplateExtractor(this.Templates);
            }
        } catch (e) {
            errors = e.message.split('\n[').map((msg: string) => msg.startsWith('[') ? msg : '[' + msg);
        }

        return errors;
    }

    public GetTemplateVariables(templateName: string): string[] {
        const analyzer: Analyzer = new Analyzer(this.Templates);

        return analyzer.AnalyzeTemplate(templateName);
    }

    public ExpandTemplate(templateName: string, scope: any, methodBinder?: IGetMethod): string[] {
        const expander: Expander = new Expander(this.Templates, methodBinder);

        return expander.ExpandTemplate(templateName, scope);
    }

    private BuildTemplates(lgFileContent: string): LGTemplate[] {
        try {
            const engine: TemplateEngine = TemplateEngine.fromText(lgFileContent);

            return engine.templates;
        } catch (e) {
            throw e;
        }
    }

    // tslint:disable-next-line: max-line-length
    private RunStaticCheck(templates: LGTemplate[]): string[] {
        const checker: StaticChecker = new StaticChecker(templates);

        return checker.Check().map((error: ReportEntry) => error.toString());
    }

    private RunTemplateExtractor(lgtemplates: LGTemplate[]): void {
        const extractor: Extractor = new Extractor(lgtemplates);
        const templates: Map<string, any>[] = extractor.Extract();
        for (const item of templates) {
            const template: any = item.entries().next().value;
            if (this.MergedTemplates.has(template[0])) {
                this.NameCollisions.push(template[0]);
                if (this.MergedTemplates.get(template[0]) instanceof Map && template[1] instanceof Map) {
                    for (const condition of (template[1] as Map<string, string[]>)) {
                        const mergedCondtions: Map<string, string[]>  = this.MergedTemplates.get(template[0]) as Map<string, string[]>;
                        if (mergedCondtions.has(condition[0])) {
                            // tslint:disable-next-line: max-line-length
                            this.MergedTemplates.set(template[0], this.MergedTemplates.get(template[0]).set(condition[0], Array.from(new Set(mergedCondtions.get(condition[0]).concat(condition[1])))));
                        } else {
                            this.MergedTemplates.set(template[0], this.MergedTemplates.get(template[0]).set(condition[0], condition[1]));
                        }
                    }
                } else if (this.MergedTemplates.get(template[0]) instanceof Array && template[1] instanceof Array) {
                    this.MergedTemplates.set(template[0], Array.from(new Set(this.MergedTemplates.get(template[0]).concat(template[1]))));
                } else {
                    // tslint:disable-next-line: max-line-length
                    const mergeError: ReportEntry = new ReportEntry(`Template ${template[0]} occurred in both normal and condition templates`);
                    this.MergerMessages.push(mergeError.toString());
                }
            } else {
                this.MergedTemplates.set(template[0], template[1]);
            }
        }
    }
}
