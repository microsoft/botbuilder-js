/**
 * @module botframework-streaming
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TransportDisconnectedEvent } from './transportDisconnectedEvent';

export type TransportDisconnectedEventHandler = (sender: any, e: TransportDisconnectedEvent) => void;
