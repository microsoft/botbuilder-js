/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Position } from './position';

/**
 * Range class
 */
export class Range {
    start: Position;
    end: Position;
    static readonly DefaultRange: Range = new Range(1, 0, 1, 0);

    /**
     * Creates a new instance of the [Range](xref:botbuilder-lg.Range) class.
     *
     * @param start Starting [Position](xref:botbuilder-lg.Position).
     * @param end Ending [Position](xref:botbuilder-lg.Position).
     */
    constructor(start: Position, end: Position);

    /**
     * Creates a new instance of the [Range](xref:botbuilder-lg.Range) class.
     *
     * @param x Starting line number in a file.
     * @param y Starting character number in a file.
     * @param endLine Ending line number in a file.
     * @param endChar Ending character number in the end line.
     */
    constructor(startLine: number, startChar: number, endLine: number, endChar: number);

    /**
     * Creates a new instance of the [Range](xref:botbuilder-lg.Range) class.
     *
     * @param x Starting line number in a file or [Position](xref:botbuilder-lg.Position).
     * @param y Starting character number in a file or [Position](xref:botbuilder-lg.Position).
     * @param endLine Optional. Ending line number in a file.
     * @param endChar Optional. Ending character number in the end line.
     */
    constructor(x: number | Position, y: number | Position, endLine?: number, endChar?: number) {
        if (typeof x === 'number' && typeof y === 'number') {
            this.start = new Position(x, y);
            this.end = new Position(endLine, endChar);
        } else if (x instanceof Position && y instanceof Position) {
            this.start = x;
            this.end = y;
        }
    }

    toString = (): string => {
        let result: string = this.start.toString();
        if (this.start.line <= this.end.line && this.start.character < this.end.character) {
            result += ` - ${this.end.toString()}`;
        }

        return result;
    };
}
