/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IStreamDescription } from './iStreamDescription';

export interface IResponsePayload {
    statusCode: number;
    streams?: IStreamDescription[];
}
