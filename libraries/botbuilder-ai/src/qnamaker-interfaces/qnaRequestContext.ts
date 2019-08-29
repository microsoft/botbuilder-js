/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
 /**
 * The context associated with QnA.  Used to mark if the current prompt is relevant with a previous question or not.
 */
export interface QnARequestContext {
    
    /**
     * The previous QnA Id that was returned.
     */
    previousQnAId: number;

    /**
     * The previous user query/question.
     */
    previousUserQuery: string;
}