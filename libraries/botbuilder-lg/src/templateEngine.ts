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
import { LGTemplate } from './lgTemplate';
import { flatten } from 'lodash';

/**
 * LG parser and evaluation engine
 */
export class TemplateEngine {

    public templates: LGTemplate[];

    public constructor() {
        this.templates = [];
    }

    public addFiles = (...filePaths: string[]) : TemplateEngine => {
        const newTemplates = flatten(filePaths.map(filePath => {
            const text = fs.readFileSync(filePath, 'utf-8');
            return this.toTemplates(this.parse(text), filePath);
        }));

        const mergedTemplates = this.templates.concat(newTemplates);
        
        this.runStaticCheck(mergedTemplates);

        this.templates = mergedTemplates;
        return this;
    }

    public addText = (text: string): TemplateEngine => {
        const newTemplates = this.toTemplates(this.parse(text), "text");
        const mergedTemplates = this.templates.concat(newTemplates);
        
        this.runStaticCheck(mergedTemplates);

        this.templates = mergedTemplates;
        return this;
    }

    /*
    public AddFiles = (...filePaths: string[]): TemplateEngine => {
        
    }
    */

    // Parse text as a LG file using antlr
    private parse = (text: string): FileContext => {
        if (text === undefined 
            || text === '' 
            || text === null) {
            return null;        
        }

        const input: ANTLRInputStream = new ANTLRInputStream(text);
        const lexer: LGFileLexer = new LGFileLexer(input);
        const tokens: CommonTokenStream = new CommonTokenStream(lexer);
        const parser: LGFileParser = new LGFileParser(tokens);
        parser.removeErrorListeners();
        parser.addErrorListener(new ErrorListener());
        parser.buildParseTree = true;

        const context: FileContext = parser.file();
        return context;
    }

    private toTemplates = (file: FileContext, source: string): LGTemplate[] => {
        if (file === undefined 
            || file === null) {
            return [];
        }
        
        const templates:TemplateDefinitionContext[] = file.paragraph()
                                                          .map((x: ParagraphContext) => x.templateDefinition())
                                                          .filter((x:TemplateDefinitionContext) => x !== undefined);
        return templates.map((x:TemplateDefinitionContext) => new LGTemplate(x, source));
    }

    
    public static fromFiles(...filePaths: string[]): TemplateEngine {
        return new TemplateEngine().addFiles(...filePaths);
    }

    public static fromText(lgFileContent: string): TemplateEngine {
       return new TemplateEngine().addText(lgFileContent);
    }

    private runStaticCheck = (templates: LGTemplate[]): void => {
        const checker: StaticChecker = new StaticChecker(templates);
        const reportMessages: ReportEntry[] = checker.Check();

        const errorMessages: ReportEntry[] = reportMessages.filter((message: ReportEntry) => message.Type === ReportEntryType.ERROR);
        if (errorMessages.length > 0) {
            throw Error(reportMessages.map((error: ReportEntry) => error.toString()).join('\n'));
        }
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

        var newTemplates = this.toTemplates(this.parse(wrappedStr), "inline");
        var mergedTemplates = this.templates.concat(newTemplates);

        this.runStaticCheck(mergedTemplates);

        const evalutor: Evaluator = new Evaluator(mergedTemplates, methodBinder);

        return evalutor.EvaluateTemplate(fakeTemplateId, scope);
    }
}
