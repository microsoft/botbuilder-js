/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { QnAResponseContext } from './qnaResponseContext';
import { AnswerSpanResponse } from './answerspanResponse';

/**
 * An individual answer returned by a call to the QnA Maker Service.
 */
export interface QnAMakerResult {
    /**
     * The list of questions indexed in the QnA Service for the given answer. (If any)
     */
    questions?: string[];

    /**
     * Answer from the knowledge base.
     */
    answer: string;

    /**
     * Confidence on a scale from 0.0 to 1.0 that the answer matches the users intent.
     */
    score: number;

    /**
     * Metadata associated with the answer (If any)
     */
    metadata?: any; // eslint-disable-line @typescript-eslint/no-explicit-any

    /**
     * The source from which the QnA was extracted (If any)
     */
    source?: string;

    /**
     * The index of the answer in the knowledge base. V3 uses 'qnaId', V4 uses 'id'. (If any)
     */
    id?: number;

    /**
     * Context for multi-turn responses.
     */
    context?: QnAResponseContext;

    /**
     * The PreciseAnswer related information in the Answer Text.
     */
    answerSpan?: AnswerSpanResponse;
}
