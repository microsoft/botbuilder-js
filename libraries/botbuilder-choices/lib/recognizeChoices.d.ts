/**
 * @module botbuilder-choices
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Choice, FoundChoice, FindChoicesOptions } from './findChoices';
import { ModelResult } from './modelResult';
/**
 * High level function for recognizing a choice in a users utterance.
 *
 * @remarks
 * This is layered above the `findChoices()` function and adds logic to let the user specify their
 * choice by index (they can say "one" to pick `choice[0]`) or ordinal position (they can say "the
 * second one" to pick `choice[1]`.) The users utterance is recognized in the following order:
 *
 * - By name using `findChoices()`.
 * - By 1's based ordinal position.
 * - By 1's based index position.
 *
 * ```JavaScript
 * const { recognizeChoices } = require('botbuilder-choices');
 *
 * const choices = ['red', 'green', 'blue'];
 * const utterance = context.activity.text;
 * const results = recognizeChoices(utterance, choices);
 * if (results.length == 1) {
 *     await context.sendActivity(`I like ${results[0].resolution.value} too!`);
 * } else if (results.length > 1) {
 *     const ambiguous = results.map((r) => r.resolution.value);
 *     await context.sendActivity(ChoiceFactory.forChannel(context, ambiguous, `Which one?`));
 * } else {
 *     await context.sendActivity(ChoiceFactory.forChannel(context, choices, `I didn't get that... Which color?`));
 * }
 * ```
 * @param utterance The text or user utterance to search over. For an incoming 'message' activity you can simply use `context.activity.text`.
 * @param choices List of choices to search over.
 * @param options (Optional) options used to tweak the search that's performed.
 */
export declare function recognizeChoices(utterance: string, choices: (string | Choice)[], options?: FindChoicesOptions): ModelResult<FoundChoice>[];
