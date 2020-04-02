/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IStatusCodeError } from 'botframework-schema';

export type StatusCode = number;

export class AuthenticationError extends Error implements IStatusCodeError {
    constructor(
        public readonly message: string,
        public readonly statusCode: StatusCode
    ) {
        super(message);
    }

    public static isStatusCodeError(err: any): err is IStatusCodeError {
        return err && err.statusCode && typeof err.statusCode === "number";
    }
}