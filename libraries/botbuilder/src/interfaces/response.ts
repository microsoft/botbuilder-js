// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

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
