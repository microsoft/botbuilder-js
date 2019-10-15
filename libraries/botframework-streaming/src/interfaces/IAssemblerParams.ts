/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IHeader } from './IHeader';

/**
 * Parameters for a streaming assembler.
 */
export interface IAssemblerParams {
    header?: IHeader;
    id?: string;
    onCompleted?: Function;
}
