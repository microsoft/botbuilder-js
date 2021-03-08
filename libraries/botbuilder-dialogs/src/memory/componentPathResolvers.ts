/**
 * @module botbuilder-dialogs
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { tests } from 'botbuilder-stdlib';
import { PathResolver } from './pathResolvers';

/**
 * Interface for declaring path resolvers.
 */
export interface ComponentPathResolvers {
    getPathResolvers(): PathResolver[];
}

/**
 * Check if a [ComponentRegistration](xref:botbuilder-core.ComponentRegistration) is
 * [ComponentPathResolvers](xref:botbuilder-dialogs.ComponentPathResolvers) or not.
 *
 * @param {ComponentRegistration} component The component registration.
 * @returns {boolean} Type check result.
 */
export function isComponentPathResolvers(component: any): component is ComponentPathResolvers {
    return tests.isObject(component) && tests.isFunc(component['getPathResolvers']);
}
