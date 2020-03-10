/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ImportDefinitionContext } from './generated/LGFileParser';

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
    public source: string;

    /**
     * The parse tree of this lg file.
     */
    public parseTree: ImportDefinitionContext;

    public constructor(parseTree: ImportDefinitionContext, source: string = '') {
        this.parseTree = parseTree;
        this.source = source;
        this.description = this.extractDescription(parseTree);
        this.id = this.extractId(parseTree);
    }

    private readonly extractDescription = (parseTree: ImportDefinitionContext): string => parseTree.text.substr(1, parseTree.text.lastIndexOf(']') - 1);

    private readonly extractId = (parseTree: ImportDefinitionContext): string => parseTree.text.substr(parseTree.text.lastIndexOf('(') + 1, parseTree.text.length - parseTree.text.lastIndexOf('(') -2);
}
