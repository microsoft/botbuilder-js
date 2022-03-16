/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { MetadataFilter } from './metadataFilter';

/**
 * Defines query filters comprising of metadata and sources
 */
export interface Filters {
    metadataFilter: MetadataFilter;
    sourceFilter: Array<string>;
    logicalOperation: string;
}
