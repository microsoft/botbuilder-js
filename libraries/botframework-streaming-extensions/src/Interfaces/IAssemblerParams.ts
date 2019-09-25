/**
 * @module botframework-streaming-extensions
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IHeader } from "./IHeader";

export interface IAssemblerParams {
    header?: IHeader;
    id?: string;
    onCompleted?: Function;
}
