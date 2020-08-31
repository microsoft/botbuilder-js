/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { DeclarativeType } from './declarativeType';
import { ResourceExplorer } from './resources';

/**
 * Defines a set of declarative components.
 */
export interface ComponentRegistration {
    getDeclarativeTypes(resourceExplorer: ResourceExplorer): DeclarativeType[];
}