/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ImportDefinitionContext } from './generated/LGFileParser';

/**
 * LG Import
 */
export class LGImport {

    public Description: string;

    public Id: string;

    public Source: string;

    public ParseTree: ImportDefinitionContext;

    constructor(parseTree: ImportDefinitionContext, source: string = '') {
        this.ParseTree = parseTree;
        this.Source = source;
        this.Description = this.ExtractDescription(parseTree);
        this.Id = this.ExtractId(parseTree);
    }

    private readonly ExtractDescription = (parseTree: ImportDefinitionContext): string => parseTree.IMPORT_DESC().text.replace('[', '').replace(']', '');

    private readonly ExtractId = (parseTree: ImportDefinitionContext): string => parseTree.IMPORT_PATH().text.replace('(', '').replace(')', '');
}
