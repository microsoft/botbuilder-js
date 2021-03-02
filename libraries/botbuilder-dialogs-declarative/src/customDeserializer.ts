/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Newable } from 'botbuilder-stdlib';

/**
 * Defines the contract for a deserializer from a configuration object to a typed object.
 */
export interface CustomDeserializer<T, C> {
    load(config: C, type: Newable<T, any[]>): T;
}
