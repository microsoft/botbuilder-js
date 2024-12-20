/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Strongly typed information corresponding to a LUIS intent.
 */
export interface IntentData {
    /**
     * Confidence in intent classification on a scale from 0.0 - 1.0.
     */
    score: number;

    /**
     * Any extra properties.
     */
    [propName: string]: any;
}
