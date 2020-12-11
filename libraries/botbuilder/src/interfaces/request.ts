// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Assertion, assert } from 'botbuilder-stdlib';

/**
 * Represents a Node.js HTTP Request, including the minimal set of use properties.
 * Compatible with Restify, Express, and Node.js core http.
 */
export interface Request<
    Body extends Record<string, unknown> = Record<string, unknown>,
    Headers extends Record<string, string[] | string | undefined> = Record<string, string[] | string | undefined>
> {
    body?: Body;
    headers: Headers;
    method?: string;
}

export const assertRequest: Assertion<Request> = (val, path) => {
    assert.unsafe.castObjectAs<Request>(val, path);
    assert.maybeDictionary(val.body, path.concat('body'));
    assert.dictionary(val.headers, path.concat('headers'));
    assert.maybeString(val.method, path.concat('method'));
};

export const isRequest = assert.toTest(assertRequest);
