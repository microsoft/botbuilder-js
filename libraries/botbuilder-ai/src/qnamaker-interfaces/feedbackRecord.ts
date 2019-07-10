/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

 /**
 * Defines active learning feedback record.
 */
export interface FeedbackRecord {
    /**
     * ID of the user.
     */
    userId: string;

    /**
     * User question.
     */
    userQuestion: string;

    /**
     * QnA id
     */
    qnaId: string;
}