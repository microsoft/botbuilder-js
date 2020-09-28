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
    public range: Range;

    /**
     * Code source, used as the lg file path.
     */
    public source: string;

    public constructor(parseTree: ParserRuleContext, source?: string, offset?: number)
    public constructor(range: Range, source?: string)
    /**
     * Creates a new instance of the SourceRange class.
     * @param x Rule invocation record for parsing.
     * @param source Optional. Source, used as the lg file path.
     * @param offset Optional. Offset in the parse tree.
     */
    public constructor(x: Range|ParserRuleContext, source?: string, offset?: number) {
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
