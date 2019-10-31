/**
 * @module botbuilder-expression-lg
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Position class
 */
export class Position {
    public Line: number;
    public Character: number;

    constructor(line: number, character: number) {
        this.Line = line;
        this.Character = character;
    }

    public test = (): string => 'Hello';
    public toString = (): string => `line ${this.Line}:${this.Character}`;
}
