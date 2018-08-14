"use strict";
/**
 * @module botbuilder-choices
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const findValues_1 = require("./findValues");
/**
 * Mid-level search function for recognizing a choice in an utterance.
 *
 * @remarks
 * This function is layered above `findValues()` and simply determines all of the synonyms that
 * should be searched for before calling `findValues()` to perform the actual search. The
 * `recognizeChoices()` function is layered above this function and adds the ability to select a
 * choice by index or ordinal position in the list. Calling this particular function is useful
 * when you don't want the index and ordinal position recognition done by `recognizeChoices()`.
 *
 * ```JavaScript
 * const { findChoices } = require('botbuilder-choices');
 *
 * const choices = ['red', 'green', 'blue'];
 * const utterance = context.activity.text;
 * const results = findChoices(utterance, choices);
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
function findChoices(utterance, choices, options) {
    const opt = options || {};
    // Normalize choices
    const list = (choices || []).map((choice, index) => typeof choice === 'string' ? { value: choice } : choice);
    // Build up full list of synonyms to search over.
    // - Each entry in the list contains the index of the choice it belongs to which will later be
    //   used to map the search results back to their choice.
    const synonyms = [];
    list.forEach((choice, index) => {
        if (!opt.noValue) {
            synonyms.push({ value: choice.value, index: index });
        }
        if (choice.action && choice.action.title && !opt.noAction) {
            synonyms.push({ value: choice.action.title, index: index });
        }
        (choice.synonyms || []).forEach((synonym) => synonyms.push({ value: synonym, index: index }));
    });
    // Find synonyms in utterance and map back to their choices
    return findValues_1.findValues(utterance, synonyms, options).map((v) => {
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
        };
    });
}
exports.findChoices = findChoices;
//# sourceMappingURL=findChoices.js.map