/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export interface IHeader {
    PayloadType: string;
    PayloadLength: number;
    Id: string;
    End: boolean;
}
