// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { assert, Assertion } from 'botbuilder-stdlib';

/**
 * Represents a Node.js HTTP Response, including the minimal set of use properties and methods.
 * Compatible with Restify, Express, and Node.js core http.
 */
export interface Response {
    socket: unknown;

    end(...args: unknown[]): unknown;
    header(name: string, value: unknown): unknown;
    send(...args: unknown[]): unknown;
    status(code: number): unknown;
}

export const assertResponse: Assertion<Response> = (val, path) => {
    assert.unsafe.castObjectAs<Response>(val, path);
    assert.unknown(val.socket, path.concat('socket'));
    assert.func(val.end, path.concat('end'));
    assert.func(val.header, path.concat('header'));
    assert.func(val.send, path.concat('send'));
    assert.func(val.status, path.concat('status'));
};

export const isResponse = assert.toTest(assertResponse);
