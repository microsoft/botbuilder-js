/**
 * @module botbuilder-choices
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { CardAction } from 'botbuilder';
import { ModelResult } from './modelResult';
import { findValues, FindValuesOptions, SortedValue } from './findValues';

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

export function findChoices(utterance: string, choices: (string|Choice)[], options?: FindChoicesOptions): ModelResult<FoundChoice>[] {
    const opt = options || {};

    // Normalize choices
    const list: Choice[] = (choices || []).map((choice, index) => typeof choice === 'string' ? { value: choice } : choice);

    // Build up full list of synonyms to search over.
    // - Each entry in the list contains the index of the choice it belongs to which will later be
    //   used to map the search results back to their choice.
    const synonyms: SortedValue[] = [];
    list.forEach((choice, index) => {
        if (!opt.noValue) { synonyms.push({ value: choice.value, index: index }) }
        if (choice.action && choice.action.title && !opt.noAction) { synonyms.push({ value: choice.action.title, index: index }) }
        (choice.synonyms || []).forEach((synonym) => synonyms.push({ value: synonym, index: index }));
    });

    // Find synonyms in utterance and map back to their choices
    return findValues(utterance, synonyms, options).map((v) => {
        const choice = list[v.resolution.index];
        return {
            start: v.start,
            end: v.end,
            typeName: 'choice',
            text: v.text,
            resolution: {
                value: choice.value,
                index: v.resolution.index,
                score: v.resolution.score,
                synonym: v.resolution.value
            }
        } as ModelResult<FoundChoice>;
    });
}
