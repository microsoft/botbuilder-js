/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Value returned from a recognizer.
 */
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
     * Intents recognized for the utterance.
     *
     * @remarks
     * A map of intent names to an object with score is returned.
     */
    readonly intents: { [name: string]: {score: number} };

    /**
     * (Optional) entities recognized.
     */
    readonly entities?: any;

    /**
     * (Optional) other properties
     */
    [propName: string]: any;
}
