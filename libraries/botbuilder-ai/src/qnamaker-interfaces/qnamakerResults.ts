/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { QnAMakerResult } from './qnamakerResult';

 /**
 * An object returned by a call to the QnA Maker Service.
 */
export interface QnAMakerResults {
    /**
     * The answers for a user query, sorted in decreasing order of ranking score.
     */
    answers?: QnAMakerResult[];

    /**
     * The active learning enable flag.
     */
    activeLearningEnabled?: boolean;
}