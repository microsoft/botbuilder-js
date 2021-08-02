/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as z from 'zod';
import { DeclarativeType } from './declarativeType';
import { ResourceExplorer } from './resources';

/**
 * Interface for registering declarative types.
 */
export interface ComponentDeclarativeTypes {
    getDeclarativeTypes(resourceExplorer: ResourceExplorer): DeclarativeType[];
}

const componentDeclarativeTypes = z.custom<ComponentDeclarativeTypes>(
    (val: any) => typeof val.getDeclarativeTypes === 'function',
    { message: 'ComponentDeclarativeTypes' }
);

/**
 * Check if a [ComponentRegistration](xref:botbuilder-core.ComponentRegistration) is
 * [ComponentDeclarativeTypes](xref:botbuilder-dialogs-declarative.ComponentDeclarativeTypes) or not.
 *
 * @param {any} component The component registration.
 * @returns {boolean} Type check result.
 */
export function isComponentDeclarativeTypes(component: unknown): component is ComponentDeclarativeTypes {
    return componentDeclarativeTypes.check(component);
}
