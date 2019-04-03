import { ANTLRInputStream } from 'antlr4ts/ANTLRInputStream';
import { BailErrorStrategy } from 'antlr4ts/BailErrorStrategy';
import { CommonTokenStream } from 'antlr4ts/CommonTokenStream';
import { TerminalNode } from 'botframework-expression//node_modules/antlr4ts/tree';
import { Evaluator } from './evaluator';
import { LGFileLexer } from './LGFileLexer';
import { FileContext, LGFileParser, ParagraphContext, ParametersContext, TemplateDefinitionContext } from './LGFileParser';
import { TemplateErrorListener } from './TemplateErrorListener';

import fs = require('fs');
import { Analyzer } from './Analyzer';

export class EvaluationContext {
    public TemplateContexts: {};
    public TemplateParameters: {};
    public constructor(templateContexts: {} = {}, templateParameters: {} = {}) {
        this.TemplateContexts = templateContexts;
        this.TemplateParameters = templateParameters;
    }
}

// tslint:disable-next-line: max-classes-per-file
export class TemplateEngine {

    private readonly evaluationContext: EvaluationContext;
    private constructor(context?: FileContext) {
        if (context === undefined) {
            this.evaluationContext = new EvaluationContext();

            return;
        }

        const templateContexts: any[] = [];
        const templateParameters: any[] = [];
        const templates: TemplateDefinitionContext[] = context.paragraph()
        .map((p: ParagraphContext) => p.templateDefinition())
        .filter((x: TemplateDefinitionContext) => x !== undefined);
        for (const template of templates) {
            const templateName: string = template.templateNameLine()
                    .templateName().text;
            if (templateContexts[templateName] === undefined) {
                templateContexts[templateName] = template;
            } else {
                throw new Error(`Duplicate template definition with name: ${templateName}`);
            }

            const parameters: ParametersContext = template.templateNameLine()
                            .parameters();
            if (parameters !== undefined) {
                templateParameters[templateName] = parameters.IDENTIFIER()
                                                    .map((x: TerminalNode) => x.text);
            }

            this.evaluationContext = new EvaluationContext(templateContexts, templateParameters);
        }
    }

    public static EmptyEngine(): TemplateEngine {
        return TemplateEngine.FromText('');
    }

    public static FromFile(filePath: string): TemplateEngine {
        return TemplateEngine.FromText(fs.readFileSync(filePath, 'utf-8'));
    }

    public static FromText(lgFileContent: string): TemplateEngine {
        if (lgFileContent === undefined || lgFileContent === '') {
            return new TemplateEngine();
        }

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

            return new TemplateEngine(context);
        } catch (e) {
            throw e;
        }
    }

    public EvaluateTemplate(templateName: string, scope: any) : string{
        const evalutor: Evaluator = new Evaluator(this.evaluationContext);

        return evalutor.EvaluateTemplate(templateName, scope);
    }

    public AnalyzeTemplate(templateName: string): string[] {
        const analyzer = new Analyzer(this.evaluationContext);

        return analyzer.AnalyzeTemplate(templateName);
    }

    public EvaluateInline(inlinsStr: string, scope: any): string {
        const fakeTemplateId: string = '__temp__';
        const wrappedStr: string = `# ${fakeTemplateId} \r\n - ${inlinsStr}`;
        try {
            const input: ANTLRInputStream = new ANTLRInputStream(wrappedStr);
            const lexer: LGFileLexer = new LGFileLexer(input);
            const tokens: CommonTokenStream = new CommonTokenStream(lexer);
            const parser: LGFileParser = new LGFileParser(tokens);
            parser.removeErrorListeners();
            parser.addErrorListener(TemplateErrorListener.INSTANCE);
            parser.buildParseTree = true;
            parser.errorHandler = new BailErrorStrategy();

            const context: TemplateDefinitionContext = parser.templateDefinition();
            const evaluationContext: EvaluationContext = new EvaluationContext(this.evaluationContext.TemplateContexts,
                                                                               this.evaluationContext.TemplateParameters);
            evaluationContext.TemplateContexts[fakeTemplateId] = context;
            const evalutor: Evaluator = new Evaluator(evaluationContext);

            return evalutor.EvaluateTemplate(fakeTemplateId, scope);
        } catch (error) {
            throw error;
        }
    }
}
