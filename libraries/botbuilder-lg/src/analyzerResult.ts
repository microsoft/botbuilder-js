/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Analyzer result. Contains variables and template references.
 */
export class AnalyzerResult {
    /**
     * Variables that this template contains.
     */
    Variables: string[];

    /**
     * template references that this template contains.
     */
    TemplateReferences: string[];

    /**
     * Creates a new instance of the [AnalyzerResult](xref:botbuilder-lg.AnalyzerResult) class.
     *
     * @param variables Init varibales.
     * @param templateRefNames Init template references.
     */
    constructor(variables: string[] = [], templateRefNames: string[] = []) {
        this.Variables = Array.from(new Set(variables));
        this.TemplateReferences = Array.from(new Set(templateRefNames));
    }

    /**
     * Combine two analyzer results.
     *
     * @param outputItem Another analyzer result.
     * @returns Combined analyzer result.
     */
    union(outputItem: AnalyzerResult): this {
        this.Variables = Array.from(new Set(this.Variables.concat(outputItem.Variables)));
        this.TemplateReferences = Array.from(new Set(this.TemplateReferences.concat(outputItem.TemplateReferences)));

        return this;
    }
}
