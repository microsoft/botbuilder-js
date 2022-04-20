/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Precise Answer, which is part of Answer returned by GenerateAnswer call to the QnA Maker Service.
 */
export interface AnswerSpanResponse {
    /**
     * The precise answer text relevant to the user query.
     */
    text: string;

    /**
     * The answer score pertaining to the quality of precise answer text.
     */
    score: number;

    /**
     * The starting index for the precise answer generated.
     */
    startIndex?: number;

    /**
     * The end index for the precise answer generated.
     */
    endIndex?: number;
}
