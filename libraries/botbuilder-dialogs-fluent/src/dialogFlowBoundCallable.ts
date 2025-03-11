// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { JsonValue } from "type-fest";


/**
 * Interface for a callable that is bound to a dialog flow context.
 * @template A The parameter types of the bound function.
 * @template R The return type of the bound function.
 */
export interface DialogFlowBoundCallable<A extends any[], R extends JsonValue> {

    /**
     * Invokes the bound function with the given arguments.
     * @param args The arguments to pass to the function.
     * @returns The observable result of the function call.
     */
    (...args: A): R;

    /**
     * Gets a new function that has the same arguments as the bound function and returns an observable
     * value of a different type.
     * 
     * @template T The type of the observable value produced by the projector
     * @param projector The callback used to convert the deserialized result to its observable value
     * @returns The projected function.
     */
    project<T>(
        projector: (value: R) => T
    ): (...args: A) => T;
}