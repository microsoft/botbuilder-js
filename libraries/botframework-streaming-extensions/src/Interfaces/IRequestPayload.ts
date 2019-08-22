/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IStreamDescription } from './iStreamDescription';

export interface IRequestPayload {
    verb: string;
    path: string;
    streams?: IStreamDescription[];
}
