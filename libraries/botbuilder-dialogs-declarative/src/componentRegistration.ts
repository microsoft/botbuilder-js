/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BuilderRegistration } from './builderRegistration';

export interface ComponentRegistration {
    getTypeBuilders(): BuilderRegistration[];
}