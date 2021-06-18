// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/**
 * Represents a Node.js HTTP Response, including the minimal set of use properties and methods.
 * Compatible with Restify, Express, and Node.js core http.
 */

import * as t from 'runtypes';

export interface Response {
    socket: unknown;

    end(...args: unknown[]): unknown;
    header(name: string, value: unknown): unknown;
    send(...args: unknown[]): unknown;
    status(code: number): unknown;
}

export const ResponseT = t
    .Record({
        end: t.Function,
        header: t.Function,
        send: t.Function,
        status: t.Function,
    })
    .withGuard((val: unknown): val is Response => val != null, { name: 'Response' });
