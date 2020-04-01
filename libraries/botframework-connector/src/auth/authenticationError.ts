/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { StatusCodes } from '../../../botbuilder-core';

export class AuthenticationError extends Error {
    constructor(
        public readonly message: string,
        public readonly statusCode: StatusCodes
    ) {
        super(message);
    }
}