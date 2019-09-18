/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line: no-submodule-imports
import { TerminalNode } from 'antlr4ts/tree';
import { ParametersContext, TemplateBodyContext, TemplateDefinitionContext, TemplateNameContext} from './generated/LGFileParser';

/**
 * Here is a data model that can easily understanded and used as the context or all kinds of visitors
 * wether it's evalator, static checker, anayler.. etc
 */
export class LGTemplate {
    /**
     * Name of the template, what's followed by '#' in a LG file
     */
    public Name: string;
    /**
     * Parameter list of this template
     */
    public Parameters: string[];
    /**
     * Source of this template, source file path if it's from a certain file
     */
    public Source: string;
    /**
     * Text format of Body of this template. All content except Name and Parameters.
     */
    public Body: string;
    /**
     * The parse tree of this template
     */
    public ParseTree: TemplateDefinitionContext;

    constructor(parseTree: TemplateDefinitionContext, lgfileContent: string, source: string = '') {
        this.ParseTree = parseTree;
        this.Source = source;

        this.Name = this.ExtractName(parseTree);
        this.Parameters = this.ExtractParameters(parseTree);
        this.Body = this.ExtractBody(parseTree, lgfileContent);
    }

    private readonly ExtractName = (parseTree: TemplateDefinitionContext): string => {
        // tslint:disable-next-line: newline-per-chained-call
        const nameContext: TemplateNameContext = parseTree.templateNameLine().templateName();
        if (nameContext === undefined || nameContext.text === undefined) {
            return '';
        }

        return  nameContext.text;
    }

    private readonly ExtractParameters = (parseTree: TemplateDefinitionContext): string[] => {
        // tslint:disable-next-line: newline-per-chained-call
        const parameters: ParametersContext = parseTree.templateNameLine().parameters();
        if (parameters !== undefined) {
            // tslint:disable-next-line: newline-per-chained-call
            return parameters.IDENTIFIER().map((x: TerminalNode) => x.text);
        }

        return [];
    }

    private readonly ExtractBody = (parseTree: TemplateDefinitionContext, lgfileContent: string): string => {
       const templateBody: TemplateBodyContext = parseTree.templateBody();
       if (templateBody === undefined) {
           return '';
       }

       const startLine: number = templateBody.start.line - 1;
       const stopLine: number = templateBody.stop.line - 1;

       return this.getRangeContent(lgfileContent, startLine, stopLine);
    }

    private getRangeContent(originString: string, startLine: number, stopLine: number) : string {
        const originList: string[] = originString.split('\n');
        if (startLine < 0 || startLine > stopLine || stopLine >= originList.length) {
            throw new Error(`index out of range.`);
        }

        const destList: string[] = originList.slice(startLine, stopLine + 1);

        let result: string = destList.join('\n');
        if (result.endsWith('\r')) {
            result = result.substr(0, result.length - 1);
        }

        return result;
    }
}
