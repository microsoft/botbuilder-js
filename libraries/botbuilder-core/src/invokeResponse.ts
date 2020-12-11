/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { assert, Assertion, Nil } from 'botbuilder-stdlib';

/**
 * Represents a response returned by a bot when it receives an `invoke` activity.
 *
 * This interface supports the framework and is not intended to be called directly for your code.
 */
export interface InvokeResponse<T = any> {
    /**
     * The HTTP status code of the response.
     */
    status: number;

    /**
     * Optional. The body of the response.
     */
    body?: T;
}

export const makeAssertInvokeResponse = <T>(bodyAssertion: Assertion<T>): Assertion<InvokeResponse<T>> => (
    val,
    path
) => {
    assert.unsafe.castObjectAs<InvokeResponse<unknown>>(val, path);
    assert.number(val.status, path.concat('status'));

    const assertMaybeBody: Assertion<T | Nil> = assert.makeMaybe(bodyAssertion);
    assertMaybeBody(val.body, path.concat('body'));
};

export const assertInvokeResponse = makeAssertInvokeResponse(assert.unknown);
