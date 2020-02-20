/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { ExpressionEngine } from 'adaptive-expressions';
import { Analyzer } from './analyzer';
import { Diagnostic } from './diagnostic';
import { Expander } from './expander';
import { Extractor } from './extractor';
import { LGParser } from './lgParser';
import { LGTemplate } from './lgTemplate';
import { Position } from './position';
import { Range } from './range';

// tslint:disable-next-line: completed-docs
export class MSLGTool {
    public collationMessages: string[] = [];
    public collatedTemplates: Map<string, any> = new Map<string, any>();
    public nameCollisions: string[] = [];

    private templates: LGTemplate[];
    private readonly expressionEngine: ExpressionEngine;

    public constructor(expressionEngine?: ExpressionEngine) {
        this.expressionEngine = expressionEngine !== undefined ? expressionEngine : new ExpressionEngine();
    }

    public validateFile(lgFileContent: string, id?: string): string[] {
        const lgFile = LGParser.parseText(lgFileContent, id);
        const diagnostic: Diagnostic[] = lgFile.diagnostics;
        if (diagnostic.length !== 0) {
            return diagnostic.map((error: Diagnostic): string => error.toString());
        }

        // extract templates
        this.templates = LGParser.parseText(lgFileContent).templates;
        if (this.templates && this.templates.length > 0) {
            this.runTemplateExtractor(this.templates);
        }

        return [];
    }

    public getTemplateVariables(templateName: string): string[] {
        const analyzer: Analyzer = new Analyzer(this.templates, this.expressionEngine);

        return analyzer.analyzeTemplate(templateName).Variables;
    }

    public expandTemplate(templateName: string, scope?: any): string[] {
        const expander: Expander = new Expander(this.templates, this.expressionEngine);

        return expander.expandTemplate(templateName, scope);
    }

    public collateTemplates(): string {
        let result = '';
        if (!this.collationMessages || this.collationMessages.length === 0) {
            for (const template of this.collatedTemplates) {
                result += '# ' + template[0] + '\n';
                if (Array.isArray(template[1])) {
                    const templateStrs: string[] = template[1] as string[];
                    for (const templateStr of templateStrs) {
                        if (templateStr.startsWith('-')) {
                            result += templateStr.slice(0, 1) + ' ' + templateStr.slice(1) + '\n';
                        } else {
                            result += templateStr + '\n';
                            break;
                        }
                    }
                } else if (template[1] instanceof Map) {
                    for (const condition of (template[1] as Map<string, string[]>)) {
                        const conditionStr: string = condition[0];
                        result += '- ' + conditionStr + '\n';
                        condition[1].forEach((templateStr: string): any => {
                            result += '   ' + templateStr.slice(0, 1) + ' ' + templateStr.slice(1) + '\n';
                        });
                    }
                } else {
                    return undefined;
                }

                result += '\n';
            }
        }

        return result;
    }

    private runTemplateExtractor(lgtemplates: LGTemplate[]): void {
        const extractor: Extractor = new Extractor(lgtemplates);
        const templates: Map<string, any>[] = extractor.extract();
        for (const item of templates) {
            const template: any = item.entries().next().value;
            if (this.collatedTemplates.has(template[0])) {
                this.nameCollisions.push(template[0]);
                if (this.collatedTemplates.get(template[0]) instanceof Map && template[1] instanceof Map) {
                    for (const condition of (template[1] as Map<string, string[]>)) {
                        const mergedCondtions: Map<string, string[]>  = this.collatedTemplates.get(template[0]) as Map<string, string[]>;
                        if (mergedCondtions.has(condition[0])) {
                            // tslint:disable-next-line: max-line-length
                            this.collatedTemplates.set(template[0], this.collatedTemplates.get(template[0]).set(condition[0], Array.from(new Set(mergedCondtions.get(condition[0]).concat(condition[1])))));
                        } else {
                            // tslint:disable-next-line: max-line-length
                            this.collatedTemplates.set(template[0], this.collatedTemplates.get(template[0]).set(condition[0], condition[1]));
                        }
                    }
                } else if (Array.isArray(this.collatedTemplates.get(template[0])) && Array.isArray(template[1])) {
                    // tslint:disable-next-line: max-line-length
                    this.collatedTemplates.set(template[0], Array.from(new Set(this.collatedTemplates.get(template[0]).concat(template[1]))));
                } else {
                    const range: Range = new Range(new Position(0, 0), new Position(0, 0));
                    // tslint:disable-next-line: max-line-length
                    const mergeError: Diagnostic = new Diagnostic(range, `Template ${ template[0] } occurred in both normal and condition templates`);
                    this.collationMessages.push(mergeError.toString());
                }
            } else {
                this.collatedTemplates.set(template[0], template[1]);
            }
        }
    }
}
