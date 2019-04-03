import { ANTLRInputStream } from 'antlr4ts/ANTLRInputStream';
import { BailErrorStrategy } from 'antlr4ts/BailErrorStrategy';
import { CommonTokenStream } from 'antlr4ts/CommonTokenStream';
import { TerminalNode } from 'botframework-expression//node_modules/antlr4ts/tree';
import { Analyzer } from './analyzer';
import { LGFileLexer } from './generator/LGFileLexer';
import { FileContext, LGFileParser, ParagraphContext, ParametersContext, TemplateDefinitionContext } from './generator/LGFileParser';
import { TemplateErrorListener } from './TemplateErrorListener';

// tslint:disable-next-line: no-require-imports
import fs = require('fs');
import { LGReportMessage, LGReportMessageType } from './exception';
import { StaticChecker } from './staticChecker';
import { EvaluationContext } from './templateEngine';
import { TemplateExtractor } from './templateExtractor';
import { Expander } from './expander';

// tslint:disable-next-line: completed-docs
export class MSLGTool {
    public MergerMessages: LGReportMessage[] = [];
    public MergedTemplates: Map<string, any> = new Map<string, any>();
    public NameCollisions: string[] = [];

    private templateContexts: EvaluationContext;

    public ValidateFile(lgFileContent: string): LGReportMessage[] {
        let initErrorMessages: LGReportMessage[] = [];
        this.templateContexts = this.BuiildTemplateContexts(lgFileContent, initErrorMessages);
        this.RunTemplateExtractor(this.templateContexts);

        return this.RunStaticCheck(this.templateContexts, initErrorMessages);
    }

    public GetTemplateVariables(templateName: string): string[] {
        const analyzer: Analyzer = new Analyzer(this.templateContexts);

        return analyzer.AnalyzeTemplate(templateName);
    }

    public ExpandTemplate(templateName: string, scope: any): string[] {
        const expander: Expander = new Expander(this.templateContexts);

        return expander.ExpandTemplate(templateName, scope);
    }

    private BuiildTemplateContexts(lgFileContent: string, initErrorMessages: LGReportMessage[] = []): EvaluationContext {
        try {
            const input: ANTLRInputStream = new ANTLRInputStream(lgFileContent);
            const lexer: LGFileLexer = new LGFileLexer(input);
            const tokens: CommonTokenStream = new CommonTokenStream(lexer);
            const parser: LGFileParser = new LGFileParser(tokens);
            parser.removeErrorListeners();
            parser.addErrorListener(TemplateErrorListener.INSTANCE);
            parser.buildParseTree = true;
            parser.errorHandler = new BailErrorStrategy();

            const context: FileContext = parser.file();
            const templateContexts: Map<string, TemplateDefinitionContext> = new Map<string, TemplateDefinitionContext>();
            const templateParameters: Map<string, string[]> = new Map<string, string[]>();
            const templates: TemplateDefinitionContext[] = context.paragraph()
                .map((p: ParagraphContext) => p.templateDefinition())
                .filter((x: TemplateDefinitionContext) => x !== undefined);
            for (const template of templates) {
                const templateName: string = template.templateNameLine()
                    .templateName().text;
                if (!templateContexts.has(templateName)) {
                    templateContexts.set(templateName, template);
                } else {
                    // tslint:disable-next-line: max-line-length
                    initErrorMessages.push(new LGReportMessage(`Duplicate template definition with name: ${templateName}`, LGReportMessageType.Error));
                }

                const parameters: ParametersContext = template.templateNameLine()
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
    private RunStaticCheck(evaluationContext: EvaluationContext, initExceptions: LGReportMessage[] = undefined): LGReportMessage[] {
        if (initExceptions === undefined) {
            initExceptions = [];
        }

        const checker: StaticChecker = new StaticChecker(evaluationContext);
        let reportMessages: LGReportMessage[] = checker.Check();

        return reportMessages.concat(initExceptions);
    }

    private RunTemplateExtractor(evaluationContext: EvaluationContext): void {
        const extractor: TemplateExtractor = new TemplateExtractor(evaluationContext);
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
                    const mergeError: LGReportMessage = new LGReportMessage(`Template ${template[0]} occurred in both normal and condition templates`, LGReportMessageType.Error);
                    this.MergerMessages.push(mergeError);
                }
            } else {
                this.MergedTemplates.set(template[0], template[1]);
            }
        }
    }
}
