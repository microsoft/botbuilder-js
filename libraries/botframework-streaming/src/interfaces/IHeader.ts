/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Streaming payload header definition.
 */
export interface IHeader {
    payloadType: string;
    payloadLength: number;
    id: string;
    end: boolean;
}
