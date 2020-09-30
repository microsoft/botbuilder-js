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
    public nullSubstitution: (path: string) => any;

    /**
     * Initializes a new instance of the `Options` class.
     * @param opt An Options instance.
     */
    public constructor(opt?: Options) {
        this.nullSubstitution = opt ? opt.nullSubstitution : undefined;
    }
}
