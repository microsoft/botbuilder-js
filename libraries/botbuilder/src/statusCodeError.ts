/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { StatusCodes } from 'botbuilder-core';

/**
 * Extends Error to provide specialized error messages.
 */
export class StatusCodeError extends Error {
    public readonly statusCode: StatusCodes;

    /**
     * Creates a new instance of the StatusCodeError class.
     * @param statusCode The status code.
     * @param message Optional. The error message.
     */
    public constructor(statusCode: StatusCodes, message?: string) {
        super(message);
        this.statusCode = statusCode;
    }
}
