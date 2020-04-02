/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IStatusCodeError, StatusCodes } from 'botframework-schema';

export class AuthenticationError extends Error implements IStatusCodeError {
    constructor(
        public readonly message: string,
        public readonly statusCode: StatusCodes
    ) {
        super(message);
    }
}