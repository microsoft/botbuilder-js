/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { SourceRange } from './sourceRange';

/**
 * Here is a data model that can help users understand and use the LG import definition in LG files easily.
 */
export class TemplateImport {
    /**
     * Description of the import, what's included by '[]' in a lg file.
     */
    description: string;

    /**
     * Id of this import.
     */
    id: string;

    /**
     * origin root source of the import.
     */
    sourceRange: SourceRange;

    /**
     * Alias for templates. For example: [import](path) as myAlias.
     */
    alias?: string;

    /**
     * Creates a new instance of the [TemplateImport](xref:botbuilder-lg.TemplateImport) class.
     *
     * @param description Import description, which is in [].
     * @param id Import id, which is a path, in ().
     * @param sourceRange [SourceRange](xref:botbuilder-lg.SourceRange) of template.
     * @param alias Imports alias.
     */
    constructor(description: string, id: string, sourceRange: SourceRange, alias?: string) {
        this.description = description;
        this.sourceRange = sourceRange;
        this.id = id;
        this.alias = alias;
    }

    toString = (): string => {
        let importStr = `[${this.description}](${this.id})`;
        if (this.alias) {
            importStr += ` as ${this.alias}`;
        }

        return importStr;
    };
}
