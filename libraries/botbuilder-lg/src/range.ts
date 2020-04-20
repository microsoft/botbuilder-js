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
    public start: Position;
    public end: Position;
    public static readonly DefaultRange: Range = new Range(1, 0, 1, 0);
    public constructor(start: Position, end: Position)
    public constructor(startLine: number, startChar: number, endLine: number, endChar: number) {
        this.start = start;
        this.end = end;
    }

    public toString = (): string => {
        let result: string = this.start.toString();
        if (this.start.line <= this.end.line && this.start.character < this.end.character) {
            result += ' - ';
            result += this.end.toString();
        }

        return result;
    }
}
