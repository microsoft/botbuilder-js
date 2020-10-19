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
 * Interface for registering declarative types.
 */
export interface ComponentDeclarativeTypes {
    getDeclarativeTypes(resourceExplorer: ResourceExplorer): DeclarativeType[];
}
