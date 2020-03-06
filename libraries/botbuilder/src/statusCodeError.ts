/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { StatusCodes } from 'botbuilder-core';

export class StatusCodeError extends Error {
    public readonly statusCode: StatusCodes;
    public constructor(statusCode: StatusCodes, message?: string) {
        super(message);
        this.statusCode = statusCode;
    }
}
