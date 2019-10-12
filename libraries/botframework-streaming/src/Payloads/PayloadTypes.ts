/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export enum PayloadTypes {
    request = 'A',
    response = 'B',
    stream = 'S',
    cancelAll = 'X',
    cancelStream = 'C'
}
