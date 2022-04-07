/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { QnAResponseContext } from '.';
import { KnowledgeBaseAnswerSpan } from './knowledgeBaseAnswerSpan';

/**
 * KnowledgeBaseAnswer - KB answer to the user query
 */
export interface KnowledgeBaseAnswer {
    answer: string;
    questions: string[];
    metadata: Map<string, string>;
    confidenceScore: number;
    source: string;
    id: number;
    dialog: QnAResponseContext;
    answerSpan: KnowledgeBaseAnswerSpan;
}
