/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Metadata associated with the answer.
 */
export interface QnAMakerMetadata {
    /**
     * Metadata name. Max length: 100.
     */
    name: string;

    /**
     * Metadata value. Max length: 100.
     */
    value: string;
}