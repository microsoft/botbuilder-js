/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Definition of a stream description.
 */
export interface IStreamDescription {
    id: string;
    contentType?: string;
    length?: number;
}
