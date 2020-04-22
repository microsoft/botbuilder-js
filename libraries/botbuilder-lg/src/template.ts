/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { SourceRange } from './sourceRange';
import * as lp from './generated/LGTemplateParser';

/**
 * Here is a data model that can easily understanded and used as the context or all kinds of visitors
 * wether it's evalator, static checker, anayler.. etc
 */
export class Template {
    /**
     * Name of the template, what's followed by '#' in a LG file
     */
    public name: string;
    /**
     * Parameter list of this template
     */
    public parameters: string[];
    /**
     * Text format of Body of this template. All content except Name and Parameters.
     */
    public body: string;
    /**
     * Source of this template
     */
    public sourceRange: SourceRange;

    public templateBodyParseTree: lp.BodyContext;

    public constructor(templatename: string, parameters: string[], templatebody: string, sourceRange: SourceRange) {
        this.name = templatename || '';
        this.parameters = parameters || [];
        this.sourceRange = sourceRange;
        this.body = templatebody || '';
    }

    public toString(): string {
        return `[${ this.name }(${ this.parameters.join(', ') })]"${ this.body }"`;
    }
}
