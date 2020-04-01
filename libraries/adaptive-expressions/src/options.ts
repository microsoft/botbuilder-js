/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Options used to define evaluation behaviors.
 */


export class Options {
    public nullSubstitution: (name: string) => object;

    public constructor(opt?: Options) {
        this.nullSubstitution = opt? opt.nullSubstitution : undefined;
    }
}