/**
 * @module botbuilder-choices
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TokenizerFunction } from './tokenizer';
import { ModelResult } from './modelResult';
/**
 * Basic search options used to control how choices are recognized in a users utterance.
 */
export interface FindValuesOptions {
    /**
     * (Optional) if true, then only some of the tokens in a value need to exist to be considered
     * a match. The default value is "false".
     */
    allowPartialMatches?: boolean;
    /**
     * (Optional) locale/culture code of the utterance. The default is `en-US`.
     */
    locale?: string;
    /**
     * (Optional) maximum tokens allowed between two matched tokens in the utterance. So with
     * a max distance of 2 the value "second last" would match the utterance "second from the last"
     * but it wouldn't match "Wait a second. That's not the last one is it?".
     * The default value is "2".
     */
    maxTokenDistance?: number;
    /**
     * (Optional) tokenizer to use when parsing the utterance and values being recognized.
     */
    tokenizer?: TokenizerFunction;
}
/**
 * INTERNAL: Raw search result returned by `findValues()`.
 */
export interface FoundValue {
    /**
     * The value that was matched.
     */
    value: string;
    /**
     * The index of the value that was matched.
     */
    index: number;
    /**
     * The accuracy with which the value matched the specified portion of the utterance. A
     * value of 1.0 would indicate a perfect match.
     */
    score: number;
}
/**
 * INTERNAL: A value that can be sorted and still refer to its original position within a source
 * array. The `findChoices()` function expands the passed in choices to individual `SortedValue`
 * instances and passes them to `findValues()`. Each individual `Choice` can result in multiple
 * synonyms that should be searched for so this data structure lets us pass each synonym as a value
 * to search while maintaining the index of the choice that value came from.
 */
export interface SortedValue {
    /** The value that will be sorted. */
    value: string;
    /** The values original position within its unsorted array. */
    index: number;
}
/**
 * INTERNAL: Low-level function that searches for a set of values within an utterance. Higher level
 * functions like `findChoices()` and `recognizeChoices()` are layered above this function.  In most
 * cases its easier to just call one of the higher level functions instead but this function contains
 * the fuzzy search algorithm that drives choice recognition.
 * @param utterance The text or user utterance to search over.
 * @param values List of values to search over.
 * @param options (Optional) options used to tweak the search that's performed.
 */
export declare function findValues(utterance: string, values: SortedValue[], options?: FindValuesOptions): ModelResult<FoundValue>[];
