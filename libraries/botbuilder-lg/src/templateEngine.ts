import { ANTLRInputStream } from 'antlr4ts/ANTLRInputStream';
import { CommonTokenStream } from 'antlr4ts/CommonTokenStream';
import { TerminalNode } from 'antlr4ts/tree';
import fs = require('fs');
import { Analyzer } from './Analyzer';
import { ErrorListener } from './errorListener';
import { Evaluator } from './evaluator';
import { LGFileLexer } from './generated/LGFileLexer';
import { FileContext, LGFileParser, ParagraphContext, ParametersContext, TemplateDefinitionContext } from './generated/LGFileParser';
import { IGetMethod } from './getMethodExtensions';
import { ReportEntry, ReportEntryType, StaticChecker } from './staticChecker';

/**
 * template context and parameters context
 */
export class EvaluationContext {
    public TemplateContexts: Map<string, TemplateDefinitionContext>;
    public TemplateParameters: Map<string, string[]>;
    // tslint:disable-next-line: max-line-length
    public constructor(templateContexts: Map<string, TemplateDefinitionContext> = new Map<string, TemplateDefinitionContext>(),
                       templateParameters: Map<string, string[]> = new Map<string, string[]>()) {
        this.TemplateContexts = templateContexts;
        this.TemplateParameters = templateParameters;
    }
}

// tslint:disable-next-line: max-classes-per-file
/**
 * LG parser and evaluation engine
 */
export class TemplateEngine {

    private readonly evaluationContext: EvaluationContext;
    private constructor(context?: FileContext) {
        if (context === undefined) {
            this.evaluationContext = new EvaluationContext();

            return;
        }

        const templateContexts: Map<string, TemplateDefinitionContext> = new Map<string, TemplateDefinitionContext>();
        const templateParameters: Map<string, string[]> = new Map<string, string[]>();
        const templates: TemplateDefinitionContext[] = context.paragraph()
        .map((p: ParagraphContext) => p.templateDefinition())
        .filter((x: TemplateDefinitionContext) => x !== undefined);

        for (const template of templates) {
            const templateName: string = template.templateNameLine().templateName().text;
            if (!templateContexts.has(templateName)) {
                templateContexts.set(templateName, template);
            } else {
                // TODO: Understand why this reports duplicate items when there are actually no duplicates
                // throw new Error(`Duplicate template definition with name: ${templateName}`);
            }

            // Extract parameter list
            const parameters: ParametersContext = template.templateNameLine().parameters();
            if (parameters !== undefined) {
                templateParameters.set(templateName, parameters.IDENTIFIER().map((x: TerminalNode) => x.text));
            }
        }
        this.evaluationContext = new EvaluationContext(templateContexts, templateParameters);
        TemplateEngine.RunStaticCheck(this.evaluationContext);
    }

    public static EmptyEngine(): TemplateEngine {
        return TemplateEngine.FromText('');
    }

    public static FromFile(filePath: string): TemplateEngine {
        return TemplateEngine.FromText(fs.readFileSync(filePath, 'utf-8'));
    }

    public static FromText(lgFileContent: string): TemplateEngine {
        if (lgFileContent === undefined
            || lgFileContent === ''
            || lgFileContent === null) {
            return new TemplateEngine();
        }

        const input: ANTLRInputStream = new ANTLRInputStream(lgFileContent);
        const lexer: LGFileLexer = new LGFileLexer(input);
        const tokens: CommonTokenStream = new CommonTokenStream(lexer);
        const parser: LGFileParser = new LGFileParser(tokens);
        parser.removeErrorListeners();
        parser.addErrorListener(new ErrorListener());
        parser.buildParseTree = true;

        const context: FileContext = parser.file();

        return new TemplateEngine(context);
    }

    public static RunStaticCheck(evaluationContext: EvaluationContext): void {
        const checker: StaticChecker = new StaticChecker(evaluationContext);
        const reportMessages: ReportEntry[] = checker.Check();

        const errorMessages: ReportEntry[] = reportMessages.filter((message: ReportEntry) => message.Type === ReportEntryType.ERROR);
        if (errorMessages.length > 0) {
            throw Error(errorMessages.join('\n'));
        }
    }

    public EvaluateTemplate(templateName: string, scope: any, methodBinder?: IGetMethod) : string {
        const evalutor: Evaluator = new Evaluator(this.evaluationContext, methodBinder);

        return evalutor.EvaluateTemplate(templateName, scope);
    }

    public AnalyzeTemplate(templateName: string): string[] {
        const analyzer: Analyzer = new Analyzer(this.evaluationContext);

        return analyzer.AnalyzeTemplate(templateName);
    }

    public Evaluate(inlinsStr: string, scope: any, methodBinder?: IGetMethod): string {

        // TODO: maybe we can directly ref the templateBody without giving a name, but that means
        // we needs to make a little changes in the evalutor, especially the loop detection part
        const fakeTemplateId: string = '__temp__';

        // wrap inline string with "# name and -" to align the evaluation process
        const wrappedStr: string = `# ${fakeTemplateId} \r\n - ${inlinsStr}`;

        // Step 1: parse input, construct parse tree
        const input: ANTLRInputStream = new ANTLRInputStream(wrappedStr);
        const lexer: LGFileLexer = new LGFileLexer(input);
        const tokens: CommonTokenStream = new CommonTokenStream(lexer);
        const parser: LGFileParser = new LGFileParser(tokens);
        parser.removeErrorListeners();
        parser.addErrorListener(new ErrorListener());
        parser.buildParseTree = true;

        // the only difference here is that we parse as templateBody, not as the whole file
        const context: TemplateDefinitionContext = parser.templateDefinition();

        // Step 2: constuct a new evalution context on top of the current one
        const evaluationContext: EvaluationContext = new EvaluationContext(this.evaluationContext.TemplateContexts,
                                                                           this.evaluationContext.TemplateParameters);
        evaluationContext.TemplateContexts.set(fakeTemplateId, context);
        const evalutor: Evaluator = new Evaluator(evaluationContext, methodBinder);

        TemplateEngine.RunStaticCheck(evaluationContext);

        // Step 3: evaluate
        return evalutor.EvaluateTemplate(fakeTemplateId, scope);
    }
}
