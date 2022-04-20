/**
 * @module botbuilder-ai
 */

/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { KnowledgeBaseAnswer } from './knowledgeBaseAnswer';

/**
 * KnowledgeBaseAnswers - query knowledgebases response format
 */
export interface KnowledgeBaseAnswers {
    answers: KnowledgeBaseAnswer[];
}
