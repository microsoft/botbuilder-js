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
    public description: string;

    /**
     * Id of this import.
     */
    public id: string;

    /**
     * origin root source of the import.
     */
    public sourceRange: SourceRange;

    /**
     * Alias for templates. For example: [import](path) as myAlias.
     */
    public alias?: string;

    /**
     * Creates a new instance of the [TemplateImport](xref:botbuilder-lg.TemplateImport) class.
     * @param description Import description, which is in [].
     * @param id Import id, which is a path, in ().
     * @param sourceRange [SourceRange](xref:botbuilder-lg.SourceRange) of template.
     * @param alias Imports alias.
     */
    public constructor(description: string, id: string, sourceRange: SourceRange, alias?: string) {
        this.description = description;
        this.sourceRange = sourceRange;
        this.id = id;
        this.alias = alias;
    }

    public toString = (): string => {
        let importStr = `[${this.description}](${this.id})`;
        if (this.alias) {
            importStr += ` as ${this.alias}`;
        }

        return importStr;
    };
}
