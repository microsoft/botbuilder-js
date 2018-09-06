/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Strongly typed information corresponding to a LUIS `$instance` value.
 */
export interface InstanceData {
    /**
     * 0-based index in the analyzed text for where entity starts.
     */
    startIndex: number;

    /**
     *  0-based index of the first character beyond the recognized entity.
     */
    endIndex: number;

    /**
     * Word broken and normalized text for the entity.
     */
    text: string;

    /**
     * (Optional) confidence in the recognition on a scale from 0.0 - 1.0.
     */
    score?: number;

    /** 
     * Any extra properties.
     */
    [propName: string] : any;
}
