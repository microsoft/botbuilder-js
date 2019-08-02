/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IStreamDescription } from './StreamDescription';

export interface IRequestPayload {
    verb: string;
    path: string;
    streams?: IStreamDescription[];
}
