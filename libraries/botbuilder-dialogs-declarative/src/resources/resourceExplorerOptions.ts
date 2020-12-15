/**
 * @module botbuilder-dialogs-declarative
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ComponentDeclarativeTypes } from '../componentDeclarativeTypes';
import { ResourceProvider } from './resourceProvider';

/**
 * Configuration options for [ResourceExplorer](xref:botbuilder-dialogs-declarative.ResourceExplorer).
 */
export interface ResourceExplorerOptions {
    /**
     * Whether cycles are allowed in resources managed by [ResourceExplorer](xref:botbuilder-dialogs-declarative.ResourceExplorer).
     */
    allowCycles?: boolean;

    /**
     * The list of resource providers to initialize the current [ResourceExplorer](xref:botbuilder-dialogs-declarative.ResourceExplorer).
     */
    providers?: ResourceProvider[];

    /**
     * The list of declarative types to use.
     */
    declarativeTypes?: ComponentDeclarativeTypes[];
}
