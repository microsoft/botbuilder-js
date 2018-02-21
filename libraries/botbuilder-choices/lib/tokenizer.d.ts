/**
 * @module botbuilder-choices
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
export interface Token {
    start: number;
    end: number;
    text: string;
    normalized: string;
}
export declare type TokenizerFunction = (text: string, locale?: string) => Token[];
/**
 * Simple tokenizer that breaks on spaces and punctuation. The only normalization done is to lowercase
 *
 */
export declare function defaultTokenizer(text: string, locale?: string): Token[];
