/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Range } from './range';
import { ParserRuleContext } from 'antlr4ts';
import { TemplateExtensions } from './templateExtensions';

/**
 * Position class
 */
export class SourceRange {
    /**
     * Range  of block.
     */
    range: Range;

    /**
     * Code source, used as the lg file path.
     */
    source: string;

    /**
     * Creates a new instance of the [SourceRange](xref:botbuilder-lg.SourceRange) class.
     *
     * @param parseTree `ParserRuleContext`. Rule invocation record for parsing.
     * @param source Optional. Source, used as the lg file path.
     * @param offset Optional. Offset in the parse tree.
     */
    constructor(parseTree: ParserRuleContext, source?: string, offset?: number);

    /**
     * Creates a new instance of the [SourceRange](xref:botbuilder-lg.SourceRange) class.
     *
     * @param range [Range](xref:botbuilder-lg.Range) of block.
     * @param source Optional. Source, used as the lg file path.
     */
    constructor(range: Range, source?: string);

    /**
     * Creates a new instance of the [SourceRange](xref:botbuilder-lg.SourceRange) class.
     *
     * @param x [Range](xref:botbuilder-lg.Range) of block or `ParserRuleContext`, rule invocation record for parsing.
     * @param source Optional. Source, used as the lg file path.
     * @param offset Optional. Offset in the parse tree.
     */
    constructor(x: Range | ParserRuleContext, source?: string, offset?: number) {
        this.source = source || '';
        if (x instanceof Range) {
            this.range = x;
        } else if (x instanceof ParserRuleContext) {
            if (!offset) {
                offset = 0;
            }

            this.range = TemplateExtensions.convertToRange(x, offset);
        }
    }
}
