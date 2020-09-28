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
    public line: number;
    public character: number;

    /**
     * Creates a new instance of the Position class.
     * @param line Line number of the current position.
     * @param character Character number of the current line.
     */
    public constructor(line: number, character: number) {
        this.line = line;
        this.character = character;
    }

    public toString = (): string => `line ${ this.line }:${ this.character }`;
}
