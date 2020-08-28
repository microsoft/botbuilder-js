/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TypeBuilder } from './factory/typeBuilder';

export interface BuilderRegistration {
    kind: string;
    builder: TypeBuilder;
}