import { ANTLRInputStream } from 'antlr4ts/ANTLRInputStream';
import { CommonTokenStream } from 'antlr4ts/CommonTokenStream';
import { TerminalNode } from 'antlr4ts/tree';
import { Analyzer } from './analyzer';
import { ErrorListener } from './errorListener';
import { LGFileLexer } from './generated/LGFileLexer';
import * as lp from './generated/LGFileParser';

// tslint:disable-next-line: no-require-imports
import { Expander, IGetMethod } from './expander';
import { Extractor } from './extractor';
import { ReportEntry, StaticChecker } from './staticChecker';
import { EvaluationContext } from './templateEngine';

// tslint:disable-next-line: completed-docs
export class MSLGTool {
    public MergerMessages: ReportEntry[] = [];
    public MergedTemplates: Map<string, any> = new Map<string, any>();
    public NameCollisions: string[] = [];

    private templateContexts: EvaluationContext;

    public ValidateFile(lgFileContent: string): ReportEntry[] {
        let initErrorMessages: ReportEntry[] = [];
        this.templateContexts = this.BuiildTemplateContexts(lgFileContent, initErrorMessages);
        this.RunTemplateExtractor(this.templateContexts);

        return this.RunStaticCheck(this.templateContexts, initErrorMessages);
    }

    public GetTemplateVariables(templateName: string): string[] {
        const analyzer: Analyzer = new Analyzer(this.templateContexts);

        return analyzer.AnalyzeTemplate(templateName);
    }

    public ExpandTemplate(templateName: string, scope: any, methodBinder?: IGetMethod): string[] {
        const expander: Expander = new Expander(this.templateContexts, methodBinder);

        return expander.ExpandTemplate(templateName, scope);
    }

    private BuiildTemplateContexts(lgFileContent: string, initErrorMessages: ReportEntry[] = []): EvaluationContext {
        try {
            if (lgFileContent === undefined
                || lgFileContent === ''
                || lgFileContent === null) {
                return new EvaluationContext();
            }

            const input: ANTLRInputStream = new ANTLRInputStream(lgFileContent);
            const lexer: LGFileLexer = new LGFileLexer(input);
            const tokens: CommonTokenStream = new CommonTokenStream(lexer);
            const parser: lp.LGFileParser = new lp.LGFileParser(tokens);
            parser.removeErrorListeners();
            parser.addErrorListener(new ErrorListener());
            parser.buildParseTree = true;

            const context: lp.FileContext = parser.file();

            const templateContexts: Map<string, lp.TemplateDefinitionContext> = new Map<string, lp.TemplateDefinitionContext>();
            const templateParameters: Map<string, string[]> = new Map<string, string[]>();
            const templates: lp.TemplateDefinitionContext[] = context.paragraph()
                .map((p: lp.ParagraphContext) => p.templateDefinition())
                .filter((x: lp.TemplateDefinitionContext) => x !== undefined);

            for (const template of templates) {
                const templateName: string = template.templateNameLine()
                    .templateName().text;
                if (!templateContexts.has(templateName)) {
                    templateContexts.set(templateName, template);
                } else {
                    // tslint:disable-next-line: max-line-length
                    initErrorMessages.push(new ReportEntry(`Duplicate template definition with name: ${templateName}`));
                }

                const parameters: lp.ParametersContext = template.templateNameLine()
                    .parameters();
                if (parameters !== undefined) {
                    templateParameters.set(templateName, parameters.IDENTIFIER().map((x: TerminalNode) => x.text));
                }
            }

            return new EvaluationContext(templateContexts, templateParameters);
        } catch (e) {
            throw e;
        }
    }

    // tslint:disable-next-line: max-line-length
    private RunStaticCheck(evaluationContext: EvaluationContext, initExceptions: ReportEntry[] = undefined): ReportEntry[] {
        if (initExceptions === undefined) {
            initExceptions = [];
        }

        const checker: StaticChecker = new StaticChecker(evaluationContext);
        let reportMessages: ReportEntry[] = checker.Check();

        return reportMessages.concat(initExceptions);
    }

    private RunTemplateExtractor(evaluationContext: EvaluationContext): void {
        const extractor: Extractor = new Extractor(evaluationContext);
        const templates: Map<string, any>[] = extractor.Extract();
        for (const item of templates) {
            const template: any = item.entries().next().value;
            if (this.MergedTemplates.has(template[0])) {
                this.NameCollisions.push(template[0]);
                if (this.MergedTemplates.get(template[0]) instanceof Map && template[1] instanceof Map) {
                    for (const condition of (template[1] as Map<string, string[]>)) {
                        const mergedCondtions  = this.MergedTemplates.get(template[0]) as Map<string, string[]>;
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
                    this.MergerMessages.push(mergeError);
                }
            } else {
                this.MergedTemplates.set(template[0], template[1]);
            }
        }
    }
}
