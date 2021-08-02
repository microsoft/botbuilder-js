/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BodyContext } from './generated/LGTemplateParser';
import { SourceRange } from './sourceRange';

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

    /**
     * Parse tree of this template.
     */
    public templateBodyParseTree: BodyContext;

    /**
     * The extended properties for the object.
     */
    public properties?: Record<string, unknown>;

    /**
     * Creates a new instance of the [Template](xref:botbuilder-lg.Template) class.
     * @param templatename Template name without parameters.
     * @param parameters Parameter list.
     * @param templatebody Template content.
     * @param sourceRange [SourceRange](xref:botbuilder-lg.SourceRange) of template.
     */
    public constructor(templatename: string, parameters: string[], templatebody: string, sourceRange: SourceRange) {
        this.name = templatename || '';
        this.parameters = parameters || [];
        this.sourceRange = sourceRange;
        this.body = templatebody || '';
    }

    /**
     * Returns a string representing the current [Template](xref:botbuilder-lg.Template) object.
     * @returns A string representing the [Template](xref:botbuilder-lg.Template).
     */
    public toString(): string {
        return `[${this.name}(${this.parameters.join(', ')})]"${this.body}"`;
    }
}
