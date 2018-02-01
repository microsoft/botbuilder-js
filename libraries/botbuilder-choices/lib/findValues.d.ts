/**
 * @module botbuilder-choices
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { TokenizerFunction } from './tokenizer';
import { ModelResult } from './modelResult';
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
/** A value that can be sorted and still refer to its original position with a source array. */
export interface SortedValue {
    /** The value that will be sorted. */
    value: string;
    /** The values original position within its unsorted array. */
    index: number;
}
/**
 * Looks for a set of values within an utterance.
 */
export declare function findValues(utterance: string, values: SortedValue[], options?: FindValuesOptions): ModelResult<FoundValue>[];
