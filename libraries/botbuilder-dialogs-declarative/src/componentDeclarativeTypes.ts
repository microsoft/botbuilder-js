/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ComponentRegistration } from 'botbuilder-core';
import { tests } from 'botbuilder-stdlib';
import { DeclarativeType } from './declarativeType';
import { ResourceExplorer } from './resources';

/**
 * Interface for registering declarative types.
 */
export interface ComponentDeclarativeTypes {
    getDeclarativeTypes(resourceExplorer: ResourceExplorer): DeclarativeType[];
}

/**
 * Check if a [ComponentRegistration](xref:botbuilder-core.ComponentRegistration) is
 * [ComponentDeclarativeTypes](xref:botbuilder-dialogs-declarative.ComponentDeclarativeTypes) or not.
 *
 * @param {ComponentRegistration} component The component registration.
 * @returns {boolean} Type check result.
 */
export function isComponentDeclarativeTypes(component: ComponentRegistration): component is ComponentDeclarativeTypes {
    return tests.isObject(component) && tests.isFunc(component['getDeclarativeTypes']);
}
