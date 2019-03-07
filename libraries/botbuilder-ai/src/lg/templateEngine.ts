import { ANTLRInputStream } from "antlr4ts/ANTLRInputStream";
import { BailErrorStrategy } from "antlr4ts/BailErrorStrategy";
import { CommonTokenStream } from "antlr4ts/CommonTokenStream";
import { Evaluator } from "./evaluator";
import { LGFileLexer } from "./LGFileLexer";
import { FileContext, LGFileParser } from "./LGFileParser";

import fs = require("fs");

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

    public static EmptyEngine(): TemplateEngine {
        return TemplateEngine.FromText("");
    }

    public static FromFile(filePath: string): TemplateEngine {
        return TemplateEngine.FromText(fs.readFileSync(filePath, "utf-8"));
    }

    public static FromText(lgFileContent: string): TemplateEngine {
        if (!lgFileContent) {
            return new TemplateEngine();
        }

        try {
            const input = new ANTLRInputStream(lgFileContent);
            const lexer = new LGFileLexer(input);
            const tokens = new CommonTokenStream(lexer);

            const parser = new LGFileParser(tokens);
            parser.buildParseTree = true;
            parser.errorHandler = new BailErrorStrategy();
            const context = parser.file();
            return new TemplateEngine(context);
        } catch (e) {
            throw e;
        }
    }

    private readonly evaluationContext: EvaluationContext = null;
    private constructor(context?: FileContext) {
        if (!context) {
            this.evaluationContext = new EvaluationContext();
            return;
        }

        const templateContexts: any[] = [];
        const templateParameters: any[] = [];
        const templates = context.paragraph()
        .map((p) => p.templateDefinition()).filter((x) => x != null && x !== undefined);
        for (const template of templates) {
            const templateName = template.templateNameLine().templateName().text;
            if (templateContexts[templateName] === undefined) {
                templateContexts[templateName] = template;
            } else {
                throw new Error(`Duplicate template definition with name: ${templateName}`);
            }

            const parameters = template.templateNameLine().parameters();
            if (parameters != null && parameters !== undefined) {
                templateParameters[templateName] = parameters.IDENTIFIER().map((x) => x.text);
            }

            this.evaluationContext = new EvaluationContext(templateContexts, templateParameters);
        }
    }

    public EvaluateTemplate(templateName: string, scope: any) {
        const evalutor = new Evaluator(this.evaluationContext);
        return evalutor.EvaluateTemplate(templateName, scope);
    }

    public EvaluateInline(inlinsStr: string, scope: any): string {
        const fakeTemplateId = "__temp__";
        const wrappedStr = `# ${fakeTemplateId} \r\n - ${inlinsStr}`;
        try {
            const input = new ANTLRInputStream(wrappedStr);
            const lexer = new LGFileLexer(input);
            const tokens = new CommonTokenStream(lexer);

            const parser = new LGFileParser(tokens);
            parser.buildParseTree = true;
            parser.errorHandler = new BailErrorStrategy();
            const context = parser.templateDefinition();
            const evaluationContext = new EvaluationContext(this.evaluationContext.TemplateContexts,
                                                        this.evaluationContext.TemplateParameters);
            evaluationContext.TemplateContexts[fakeTemplateId] = context;
            const evalutor = new Evaluator(evaluationContext);

            return evalutor.EvaluateTemplate(fakeTemplateId, scope);
        } catch (error) {
            throw error;
        }
    }
}
