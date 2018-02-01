/**
 * @module botbuilder-choices
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { CardAction } from 'botbuilder';
import { ModelResult } from './modelResult';
import { FindValuesOptions } from './findValues';
export interface Choice {
    /** Value to return when selected.  */
    value: string;
    /** (Optional) action to use when rendering the choice as a suggested action. */
    action?: CardAction;
    /** (Optional) list of synonyms to recognize in addition to the value. */
    synonyms?: string[];
}
export interface FindChoicesOptions extends FindValuesOptions {
    /**
     * (Optional) locale of the user preferred language. This is used when recognizing the
     * numerical or ordinal index of the choice. The default is assumed to be `en-US`.
     */
    culture?: string;
    /**
     * (Optional) If `true`, the choices value will NOT be search over. The default is `false`.
     */
    noValue?: boolean;
    /**
     * (Optional) If `true`, the title of the choices action will NOT be searched over. The default is `false`.
     */
    noAction?: boolean;
}
export interface FoundChoice {
    /** The value of the choice that was matched. */
    value: string;
    /** The choices index within the list of choices that was searched over. */
    index: number;
    /**
     * The accuracy with which the synonym matched the specified portion of the utterance. A
     * value of 1.0 would indicate a perfect match.
     */
    score: number;
    /** (Optional) The synonym that was matched. */
    synonym?: string;
}
export declare function findChoices(utterance: string, choices: (string | Choice)[], options?: FindChoicesOptions): ModelResult<FoundChoice>[];
