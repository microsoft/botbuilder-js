/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IStreamDescription } from './IStreamDescription';

export interface IRequestPayload {
    verb: string;
    path: string;
    streams?: IStreamDescription[];
}
