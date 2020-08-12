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
     * The locale info for evaluating Expressions.
     */
    public locale: string;

    public constructor(opt?: Options) {
        this.nullSubstitution = opt ? opt.nullSubstitution : undefined;
        this.locale = opt ? opt.locale : undefined;
    }
}