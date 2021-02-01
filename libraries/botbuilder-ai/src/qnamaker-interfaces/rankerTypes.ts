/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

/**
 * Enumeration of types of ranking.
 */
export enum RankerTypes {
    /**
     * Default Ranker Behaviour. i.e. Ranking based on Questions and Answer.
     */
    default = 'Default',

    /**
     * Ranker based on question Only.
     */
    questionOnly = 'QuestionOnly',

    /**
     * Ranker based on Autosuggest for question field Only.
     */
    autoSuggestQuestion = 'AutoSuggestQuestion',
}
