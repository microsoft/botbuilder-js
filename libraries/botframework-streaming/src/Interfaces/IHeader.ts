/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export interface IHeader {
    payloadType: string;
    payloadLength: number;
    id: string;
    end: boolean;
}
