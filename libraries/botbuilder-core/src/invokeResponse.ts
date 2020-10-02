/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

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
