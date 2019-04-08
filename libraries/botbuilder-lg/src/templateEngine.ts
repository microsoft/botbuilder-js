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

/**
 * LG parser and evaluation engine
 */
export class TemplateEngine {

    public Templates: LGTemplate[];

    public constructor() {
        this.Templates = [];
    }

    public AddFile = (filePath: string) : TemplateEngine => {
        const text = fs.readFileSync(filePath, 'utf-8');
        const newTemplates = this.toTemplates(this.parse(text), filePath);
        const mergedTemplates = this.Templates.concat(newTemplates);
        
        this.runStaticCheck(mergedTemplates);

        this.Templates = mergedTemplates;
        return this;
    }

    public AddText = (text: string): TemplateEngine => {
        const newTemplates = this.toTemplates(this.parse(text), "text");
        const mergedTemplates = this.Templates.concat(newTemplates);
        
        this.runStaticCheck(mergedTemplates);

        this.Templates = mergedTemplates;
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

    

    public static FromFile(filePath: string): TemplateEngine {
        return new TemplateEngine().AddFile(filePath);
    }

    public static FromText(lgFileContent: string): TemplateEngine {
       return new TemplateEngine().AddText(lgFileContent);
    }

    private runStaticCheck = (templates: LGTemplate[]): void => {
        const checker: StaticChecker = new StaticChecker(templates);
        const reportMessages: ReportEntry[] = checker.Check();

        const errorMessages: ReportEntry[] = reportMessages.filter((message: ReportEntry) => message.Type === ReportEntryType.ERROR);
        if (errorMessages.length > 0) {
            throw Error(errorMessages.join('\n'));
        }
    }

    public EvaluateTemplate(templateName: string, scope: any, methodBinder?: IGetMethod) : string {
        const evalutor: Evaluator = new Evaluator(this.Templates, methodBinder);

        return evalutor.EvaluateTemplate(templateName, scope);
    }

    public AnalyzeTemplate(templateName: string): string[] {
        const analyzer: Analyzer = new Analyzer(this.Templates);

        return analyzer.AnalyzeTemplate(templateName);
    }

    public Evaluate(inlinsStr: string, scope: any, methodBinder?: IGetMethod): string {
        // wrap inline string with "# name and -" to align the evaluation process
        const fakeTemplateId: string = '__temp__';
        const wrappedStr: string = `# ${fakeTemplateId} \r\n - ${inlinsStr}`;

        var newTemplates = this.toTemplates(this.parse(wrappedStr), "inline");
        var mergedTemplates = this.Templates.concat(newTemplates);

        this.runStaticCheck(mergedTemplates);

        const evalutor: Evaluator = new Evaluator(mergedTemplates, methodBinder);

        return evalutor.EvaluateTemplate(fakeTemplateId, scope);
    }
}
