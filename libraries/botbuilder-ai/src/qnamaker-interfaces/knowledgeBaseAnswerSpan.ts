/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * KnowledgeBaseAnswerSpan - precise answer format
 */
export interface KnowledgeBaseAnswerSpan {
    text: string;
    confidenceScore: number;
    offset: number;
    length: number;
}
