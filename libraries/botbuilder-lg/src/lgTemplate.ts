/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
// tslint:disable-next-line: no-submodule-imports
import { TerminalNode } from 'antlr4ts/tree';
import { ParametersContext, TemplateDefinitionContext } from './generated/LGFileParser';

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

    constructor(parseTree: TemplateDefinitionContext, source: string = '') {
        this.ParseTree = parseTree;
        this.Source = source;

        this.Name = this.ExtractName(parseTree);
        this.Parameters = this.ExtractParameters(parseTree);
        this.Body = this.ExtractBody(parseTree);
    }

    private readonly ExtractName = (parseTree: TemplateDefinitionContext): string => {
        return  parseTree.templateNameLine().templateName().text;
    }

    private readonly ExtractParameters = (parseTree: TemplateDefinitionContext): string[] => {
        const parameters: ParametersContext = parseTree.templateNameLine().parameters();
        if (parameters !== undefined) {
            return parameters.IDENTIFIER().map((x: TerminalNode) => x.text);
        }

        return [];
    }

    private readonly ExtractBody = (parseTree: TemplateDefinitionContext): string => {
        if (parseTree.templateBody() !== undefined) {
            return parseTree.templateBody().text;
        }

        return '';
    }
}
