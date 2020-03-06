/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line: no-submodule-imports
import { TerminalNode } from 'antlr4ts/tree';
import { ParametersContext, TemplateBodyContext, TemplateDefinitionContext, TemplateNameContext, FileContext} from './generated/LGFileParser';

/**
 * Here is a data model that can easily understanded and used as the context or all kinds of visitors
 * wether it's evalator, static checker, anayler.. etc
 */
export class LGTemplate {
    /**
     * Name of the template, what's followed by '#' in a LG file
     */
    public name: string;
    /**
     * Parameter list of this template
     */
    public parameters: string[];
    /**
     * Source of this template, source file path if it's from a certain file
     */
    public source: string;
    /**
     * Text format of Body of this template. All content except Name and Parameters.
     */
    public body: string;
    /**
     * The parse tree of this template
     */
    public parseTree: TemplateDefinitionContext;

    public constructor(parseTree: TemplateDefinitionContext, lgfileContent: string, source: string = '') {
        this.parseTree = parseTree;
        this.source = source;

        this.name = this.extractName();
        this.parameters = this.extractParameters();
        this.body = this.extractBody(lgfileContent);
    }

    public getTemplateRange(): {startLine: number; stopLine: number} {
        const startLine: number = this.parseTree.start.line - 1;
        let  stopLine: number = this.parseTree.stop.line - 1;
        if(this.parseTree.parent && this.parseTree.parent.parent && this.parseTree.parent.parent instanceof FileContext) {
            const fileContext = this.parseTree.parent.parent as FileContext;
            const templateDefinitions = fileContext.paragraph()
                .map((u): TemplateDefinitionContext => u.templateDefinition())
                .filter((u): boolean => u !== undefined);
            
            const currentIndex = templateDefinitions.indexOf(this.parseTree);
            if (currentIndex >= 0 && currentIndex < templateDefinitions.length - 1) {
                // in the middle of templates
                stopLine = templateDefinitions[currentIndex + 1].start.line - 2;
            } else {
                // last item
                stopLine = fileContext.stop.line - 1;
            }

            if (stopLine <= startLine)
            {
                stopLine = startLine;
            }
        }

        return {startLine, stopLine};
    }
    private readonly extractName = (): string => {
        // tslint:disable-next-line: newline-per-chained-call
        const nameContext: TemplateNameContext = this.parseTree.templateNameLine().templateName();
        if (!nameContext || !nameContext.text) {
            return '';
        }

        return  nameContext.text;
    }

    private readonly extractParameters = (): string[] => {
        // tslint:disable-next-line: newline-per-chained-call
        const parameters: ParametersContext = this.parseTree.templateNameLine().parameters();
        if (parameters !== undefined) {
            // tslint:disable-next-line: newline-per-chained-call
            return parameters.IDENTIFIER().map((x: TerminalNode): string => x.text);
        }

        return [];
    }

    private readonly extractBody = (lgfileContent: string): string => {
        let startLine: number;
        let stopLine: number;

        ({startLine, stopLine} = this.getTemplateRange());

        return startLine >= stopLine ? '' : this.getRangeContent(lgfileContent, startLine + 1, stopLine);
    }

    private getRangeContent(originString: string, startLine: number, stopLine: number): string {
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

    public toString(): string {
        return `[${ this.name }(${ this.parameters.join(', ') })]"${ this.body }"`;
    }
}
