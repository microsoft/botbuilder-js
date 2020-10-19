/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Anchor for relative position in a sequence.
 */
export enum Anchor {
    Current = 'current',
    Start = 'start',
    End = 'end',
}

/**
 * Position in a sequence relative to another position.
 */
export interface OrdinalV2 {
    /**
     * Anchor for the offset.
     */
    relativeTo: Anchor;

    /**
     * Offset relative to position in sequence.
     */
    offset: number;
}
