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

    /**
     * Content parse tree form LGFileParser.g4.
     */
    public parseTree: ParserRuleContext;

    public constructor(parseTree: ParserRuleContext, source?: string, offset?: number)
    public constructor(range: Range, source?: string)
    public constructor(x: Range|ParserRuleContext, source?: string, offset?: number) {
        this.source = source || '';
        if (x instanceof Range) {
            this.range = x;
        } else if (x instanceof ParserRuleContext) {
            if (!offset) {
                offset = 0;
            }

            this.parseTree = x;
            this.range = TemplateExtensions.convertToRange(x, offset);
        }
    }
}
