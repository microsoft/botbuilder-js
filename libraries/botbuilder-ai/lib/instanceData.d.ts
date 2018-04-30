/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
*/
/** Strongly typed information corresponding to LUIS $instance value. */
export interface InstanceData {
    /** 0-based index in the analyzed text for where entity starts. */
    startIndex: number;
    /** 0-based index of the first character beyond the recognized entity. */
    endIndex: number;
    text: string;
    /** Optional confidence in the recognition. */
    score?: number;
}
