/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TransportDisconnectedEventArgs } from './transportDisconnectedEventArgs';

export type TransportDisconnectedEventHandler = (sender: any, e: TransportDisconnectedEventArgs) => void;
