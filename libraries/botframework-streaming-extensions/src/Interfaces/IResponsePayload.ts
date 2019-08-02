/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IStreamDescription } from './IStreamDescription';

export interface IResponsePayload {
    statusCode: number;
    streams?: IStreamDescription[];
}
