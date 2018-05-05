/**
 * @module botbuilder-choices
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
/**
* Individual token returned by a `TokenizerFunction`.
*/
export interface Token {
    /** Start character position of the token within the outer string. */
    start: number;
    /** End character position of the token within the outer string. */
    end: number;
    /** Original text of the token. */
    text: string;
    /** Normalized form of the token. This can include things like lower casing or stemming. */
    normalized: string;
}
/**
 * Signature for an alternate word breaker that can be passed to `recognizeChoices()`,
 * `findChoices()`, or `findValues()`.
 *
 * ```TypeScript
 * type TokenizerFunction = (text: string, locale?: string) => Token[];
 * ```
 *
 * @remarks
 * The `defaultTokenizer()` is fairly simple and only breaks on spaces and punctuation.
 * @param TokenizerFunction.text The text to be tokenized.
 * @param TokenizerFunction.locale (Optional) locale of the text if known.
 */
export declare type TokenizerFunction = (text: string, locale?: string) => Token[];
/**
 * Simple tokenizer that breaks on spaces and punctuation.
 *
 * @remarks
 * The only normalization done is to lowercase the tokens. Developers can wrap this tokenizer with
 * their own function to perform additional normalization like [stemming](https://github.com/words/stemmer).
 *
 * ```JavaScript
 * const { recognizeChoices, defaultTokenizer } = require('botbuilder-choices');
 * const stemmer = require('stemmer');
 *
 * function customTokenizer(text, locale) {
 *     const tokens = defaultTokenizer(text, locale);
 *     tokens.forEach((t) => {
 *         t.normalized = stemmer(t.normalized);
 *     });
 *     return tokens;
 * }
 *
 * const choices = ['red', 'green', 'blue'];
 * const utterance = context.activity.text;
 * const results = recognizeChoices(utterance, choices, { tokenizer: customTokenizer });
 * ```
 */
export declare function defaultTokenizer(text: string, locale?: string): Token[];
