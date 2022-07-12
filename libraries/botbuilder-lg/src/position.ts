/**
 * @module botbuilder-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Position class
 */
export class Position {
    line: number;
    character: number;

    /**
     * Creates a new instance of the [Position](xref:botbuilder-lg.Position) class.
     *
     * @param line Line number of the current position.
     * @param character Character number of the current line.
     */
    constructor(line: number, character: number) {
        this.line = line;
        this.character = character;
    }

    toString = (): string => `line ${this.line}:${this.character}`;
}
