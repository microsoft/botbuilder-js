/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { tests } from 'botbuilder-stdlib';
import { MemoryScope } from './scopes';

/**
 * Interface for enumerating memory scopes.
 */
export interface ComponentMemoryScopes {
    getMemoryScopes(): MemoryScope[];
}

/**
 * Check if a [ComponentRegistration](xref:botbuilder-core.ComponentRegistration) is
 * [ComponentMemoryScopes](xref:botbuilder-dialogs.ComponentMemoryScopes) or not.
 *
 * @param {ComponentRegistration} component The component registration.
 * @returns {boolean} Type check result.
 */
export function isComponentMemoryScopes(component: any): component is ComponentMemoryScopes {
    return tests.isObject(component) && tests.isFunc(component['getMemoryScopes']);
}
