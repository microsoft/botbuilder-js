/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export interface CustomDeserializer<T, C> {
    load(config: C, type: new (...args: unknown[]) => T): T;
}
