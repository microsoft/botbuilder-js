/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Defines metadata filters and corresponding logical operation.
 */
export interface MetadataFilter {
    metadata: Array<{ key: string; value: string }>;
    logicalOperation: string;
}
