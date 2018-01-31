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