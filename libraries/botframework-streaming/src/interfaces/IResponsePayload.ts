/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IStreamDescription } from './IStreamDescription';

/**
 * Base class for all dialogs.
 */
export interface IResponsePayload {
    statusCode: number;
    streams?: IStreamDescription[];
}
