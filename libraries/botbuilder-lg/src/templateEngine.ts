/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line: no-submodule-imports
import { ANTLRInputStream } from 'antlr4ts/ANTLRInputStream';
// tslint:disable-next-line: no-submodule-imports
import { CommonTokenStream } from 'antlr4ts/CommonTokenStream';
import * as fs from 'fs';
import { flatten } from 'lodash';
import { Analyzer } from './Analyzer';
import { ErrorListener } from './errorListener';
import { Evaluator } from './evaluator';
import { LGFileLexer } from './generated/LGFileLexer';
import { FileContext, LGFileParser, ParagraphContext, ParametersContext, TemplateDefinitionContext } from './generated/LGFileParser';
import { IGetMethod } from './getMethodExtensions';
import { LGTemplate } from './lgTemplate';
import { ReportEntry, ReportEntryType, StaticChecker } from './staticChecker';

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

            return this.toTemplates(this.parse(text), filePath);
        }));

        const mergedTemplates: LGTemplate[] = this.templates.concat(newTemplates);

        this.runStaticCheck(mergedTemplates);

        this.templates = mergedTemplates;

        return this;
    }

    public addText = (text: string): TemplateEngine => {
        const newTemplates: LGTemplate[] = this.toTemplates(this.parse(text), 'text');
        const mergedTemplates: LGTemplate[] = this.templates.concat(newTemplates);

        this.runStaticCheck(mergedTemplates);

        this.templates = mergedTemplates;

        return this;
    }

    public evaluateTemplate(templateName: string, scope: any, methodBinder?: IGetMethod) : string {
        const evalutor: Evaluator = new Evaluator(this.templates, methodBinder);

        return evalutor.EvaluateTemplate(templateName, scope);
    }

    public analyzeTemplate(templateName: string): string[] {
        const analyzer: Analyzer = new Analyzer(this.templates);

        return analyzer.AnalyzeTemplate(templateName);
    }

    public evaluate(inlinsStr: string, scope: any, methodBinder?: IGetMethod): string {
        // wrap inline string with "# name and -" to align the evaluation process
        const fakeTemplateId: string = '__temp__';
        const wrappedStr: string = `# ${fakeTemplateId} \r\n - ${inlinsStr}`;

        const newTemplates: LGTemplate[] = this.toTemplates(this.parse(wrappedStr), 'inline');
        const mergedTemplates: LGTemplate[] = this.templates.concat(newTemplates);

        this.runStaticCheck(mergedTemplates);

        const evalutor: Evaluator = new Evaluator(mergedTemplates, methodBinder);

        return evalutor.EvaluateTemplate(fakeTemplateId, scope);
    }

    /*
    public AddFiles = (...filePaths: string[]): TemplateEngine => {

    }
    */

    // Parse text as a LG file using antlr
    private readonly parse = (text: string): FileContext => {
        if (text === undefined
            || text === ''
            || text === null) {
            return undefined;
        }

        const input: ANTLRInputStream = new ANTLRInputStream(text);
        const lexer: LGFileLexer = new LGFileLexer(input);
        const tokens: CommonTokenStream = new CommonTokenStream(lexer);
        const parser: LGFileParser = new LGFileParser(tokens);
        parser.removeErrorListeners();
        parser.addErrorListener(new ErrorListener());
        parser.buildParseTree = true;

        return parser.file();
    }

    private readonly toTemplates = (file: FileContext, source: string): LGTemplate[] => {
        if (file === undefined
            || file === null) {
            return [];
        }

        const templates: TemplateDefinitionContext[] = file.paragraph()
                                                          .map((x: ParagraphContext) => x.templateDefinition())
                                                          .filter((x: TemplateDefinitionContext) => x !== undefined);

        return templates.map((x: TemplateDefinitionContext) => new LGTemplate(x, source));
    }

    private readonly runStaticCheck = (templates: LGTemplate[]): void => {
        const checker: StaticChecker = new StaticChecker(templates);
        const reportMessages: ReportEntry[] = checker.Check();

        const errorMessages: ReportEntry[] = reportMessages.filter((message: ReportEntry) => message.Type === ReportEntryType.ERROR);
        if (errorMessages.length > 0) {
            throw Error(reportMessages.map((error: ReportEntry) => error.toString()).join('\n'));
        }
    }
}
