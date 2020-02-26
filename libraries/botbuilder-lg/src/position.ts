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

    public constructor(line: number, character: number) {
        this.line = line;
        this.character = character;
    }

    public toString = (): string => `line ${ this.line }:${ this.character }`;
}
