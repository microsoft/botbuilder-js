/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BuilderRegistration } from './builderRegistration';
import { ResourceExplorer } from './resources';

export interface ComponentRegistration {
    getBuilderRegistrations(resourceExplorer: ResourceExplorer): BuilderRegistration[];
}