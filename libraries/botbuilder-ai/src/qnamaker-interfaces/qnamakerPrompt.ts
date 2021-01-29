/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
 * QnAMaker Prompt Object.
 */
export interface QnAMakerPrompt {
    /**
     * Display Order - index of the prompt - used in ordering of the prompts.
     */
    displayOrder: number;

    /**
     * Qna id corresponding to the prompt - if QnaId is present, QnADTO object is ignored.
     */
    qnaId: number;

    /**
     * The QnA object returned from the API (Optional parameter).
     */
    qna?: object; // eslint-disable-line @typescript-eslint/ban-types

    /**
     * Display Text - Text displayed to represent a follow up question prompt.
     */
    displayText: string;
}
