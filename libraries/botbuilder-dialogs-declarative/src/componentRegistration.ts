/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TypeRegistration } from './typeRegistration';

export interface ComponentRegistration {
    getTypes(): TypeRegistration[];
}