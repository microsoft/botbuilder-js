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
    public constructor(startLine: number, startChar: number, endLine: number, endChar: number) 
    /**
     * Creates a new instance of the Range class.
     * @param x Starting line number in a file.
     * @param y Starting character number in a file.
     * @param endLine Ending line number in a file.
     * @param endChar Ending character number in the end line.
     */
    public constructor(x: number|Position, y: number|Position, endLine?: number, endChar?: number){
        if (typeof x === 'number' && typeof y === 'number') {
            this.start = new Position(x, y);
            this.end =  new Position(endLine, endChar);
        } else if (x instanceof Position && y instanceof Position){
            this.start = x;
            this.end =  y;
        }
        
    }

    public toString = (): string => {
        let result: string = this.start.toString();
        if (this.start.line <= this.end.line && this.start.character < this.end.character) {
            result += ` - ${ this.end.toString() }`;
        }

        return result;
    }
}
