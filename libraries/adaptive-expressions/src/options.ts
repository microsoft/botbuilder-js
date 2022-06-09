/**
 * @module adaptive-expressions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {AbortController} from "abort-controller"
/**
 * Options used to define evaluation behaviors.
 */
export class Options {
    public nullSubstitution: (path: string) => unknown;

    /**
     * The locale info for evaluating Expressions.
     */
    public locale: string;

    public abort: AbortController;

    /**
     * Initializes a new instance of the [Options](xref:adaptive-expressions.Options) class.
     *
     * @param opt Optional. An [Options](xref:adaptive-expressions.Options) instance.
     */
    public constructor(opt?: Options) {
        this.nullSubstitution = opt ? opt.nullSubstitution : undefined;
        this.locale = opt ? opt.locale : undefined;
        this.abort = opt && opt.abort ? opt.abort : new AbortController();
    }
}
