/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { IHeader } from './IHeader';
import { IReceiveRequest } from './IReceiveRequest';
import { IReceiveResponse } from './IReceiveResponse';

/**
 * Parameters for a streaming assembler.
 *
 * @internal
 */
export interface IAssemblerParams {
    header?: IHeader;
    id?: string;
    onCompleted?: (id: string, receiveResponse: IReceiveResponse | IReceiveRequest) => Promise<void>;
}
