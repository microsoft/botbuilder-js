/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

// Return result from a recognizer.
export interface RecognizerResult {
    /**
     * Utterance sent to recognizer
     */
    readonly text: string;

    /**
     * If original text is changed by things like spelling, the altered version.
     */
    readonly alteredText?: string;

    /**
     * Intents recognized for the utterance. A map of intent names to an object with score is returned.
     */
    readonly intents: { [name: string]: {score: number} };

    /**
     * Entities
     */
    readonly entities?: any;

    /**
     * Other properties
     */
     [propName: string]: any;
}
