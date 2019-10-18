/**
 * @module botbuilder-expression-lg
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
    public Start: Position;
    public End: Position;

    constructor(start: Position, end: Position) {
        this.Start = start;
        this.End = end;
    }

    public toString = (): string => {
        let result: string = this.Start.toString();
        if (this.Start.Line <= this.End.Line && this.Start.Character < this.End.Character) {
            result += ' - ';
            result += this.End.toString();
        }

        return result;
    }
}
