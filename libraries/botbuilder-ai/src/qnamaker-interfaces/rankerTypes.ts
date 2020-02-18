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
export class RankerTypes {

    /**
     * Default Ranker Behaviour. i.e. Ranking based on Questions and Answer.
     */
    public static readonly default: string = 'Default';

    /**
     * Ranker based on question Only.
     */
    public static readonly questionOnly: string = 'QuestionOnly';

    /**
     * Ranker based on Autosuggest for question field Only.
     */
    public static readonly autoSuggestQuestion: string = 'AutoSuggestQuestion';
}