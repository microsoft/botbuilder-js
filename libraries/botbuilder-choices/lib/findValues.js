"use strict";
/**
 * @module botbuilder-choices
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const tokenizer_1 = require("./tokenizer");
/**
 * INTERNAL: Low-level function that searches for a set of values within an utterance. Higher level
 * functions like `findChoices()` and `recognizeChoices()` are layered above this function.  In most
 * cases its easier to just call one of the higher level functions instead but this function contains
 * the fuzzy search algorithm that drives choice recognition.
 * @param utterance The text or user utterance to search over.
 * @param values List of values to search over.
 * @param options (Optional) options used to tweak the search that's performed.
 */
function findValues(utterance, values, options) {
    function indexOfToken(token, startPos) {
        for (let i = startPos; i < tokens.length; i++) {
            if (tokens[i].normalized === token.normalized) {
                return i;
            }
        }
        return -1;
    }
    function matchValue(index, value, vTokens, startPos) {
        // Match value to utterance and calculate total deviation.
        // - The tokens are matched in order so "second last" will match in 
        //   "the second from last one" but not in "the last from the second one".
        // - The total deviation is a count of the number of tokens skipped in the 
        //   match so for the example above the number of tokens matched would be
        //   2 and the total deviation would be 1. 
        let matched = 0;
        let totalDeviation = 0;
        let start = -1;
        let end = -1;
        vTokens.forEach((token) => {
            // Find the position of the token in the utterance.
            const pos = indexOfToken(token, startPos);
            if (pos >= 0) {
                // Calculate the distance between the current tokens position and the previous tokens distance.
                const distance = matched > 0 ? pos - startPos : 0;
                if (distance <= maxDistance) {
                    // Update count of tokens matched and move start pointer to search for next token after
                    // the current token.
                    matched++;
                    totalDeviation += distance;
                    startPos = pos + 1;
                    // Update start & end position that will track the span of the utterance that's matched.
                    if (start < 0) {
                        start = pos;
                    }
                    end = pos;
                }
            }
        });
        // Calculate score and format result
        // - The start & end positions and the results text field will be corrected by the caller.
        let result;
        if (matched > 0 && (matched == vTokens.length || opt.allowPartialMatches)) {
            // Percentage of tokens matched. If matching "second last" in 
            // "the second from last one" the completeness would be 1.0 since
            // all tokens were found.
            const completeness = matched / vTokens.length;
            // Accuracy of the match. The accuracy is reduced by additional tokens
            // occurring in the value that weren't in the utterance. So an utterance
            // of "second last" matched against a value of "second from last" would
            // result in an accuracy of 0.5. 
            const accuracy = (matched / (matched + totalDeviation));
            // The final score is simply the completeness multiplied by the accuracy.
            const score = completeness * accuracy;
            // Format result
            result = {
                start: start,
                end: end,
                typeName: 'value',
                resolution: {
                    value: value,
                    index: index,
                    score: score
                }
            };
        }
        return result;
    }
    // Sort values in descending order by length so that the longest value is searched over first.
    const list = values.sort((a, b) => b.value.length - a.value.length);
    // Search for each value within the utterance.
    let matches = [];
    const opt = options || {};
    const tokenizer = (opt.tokenizer || tokenizer_1.defaultTokenizer);
    const tokens = tokenizer(utterance, opt.locale);
    const maxDistance = opt.maxTokenDistance !== undefined ? opt.maxTokenDistance : 2;
    list.forEach((entry, index) => {
        // Find all matches for a value
        // - To match "last one" in "the last time I chose the last one" we need 
        //   to re-search the string starting from the end of the previous match.
        // - The start & end position returned for the match are token positions.
        let startPos = 0;
        const vTokens = tokenizer(entry.value.trim(), opt.locale);
        while (startPos < tokens.length) {
            const match = matchValue(entry.index, entry.value, vTokens, startPos);
            if (match) {
                startPos = match.end + 1;
                matches.push(match);
            }
            else {
                break;
            }
        }
    });
    // Sort matches by score descending
    matches = matches.sort((a, b) => b.resolution.score - a.resolution.score);
    // Filter out duplicate matching indexes and overlapping characters.
    // - The start & end positions are token positions and need to be translated to 
    //   character positions before returning. We also need to populate the "text"
    //   field as well. 
    const results = [];
    const foundIndexes = {};
    const usedTokens = {};
    matches.forEach((match) => {
        // Apply filters
        let add = !foundIndexes.hasOwnProperty(match.resolution.index);
        for (let i = match.start; i <= match.end; i++) {
            if (usedTokens[i]) {
                add = false;
                break;
            }
        }
        // Add to results
        if (add) {
            // Update filter info
            foundIndexes[match.resolution.index] = true;
            for (let i = match.start; i <= match.end; i++) {
                usedTokens[i] = true;
            }
            // Translate start & end and populate text field
            match.start = tokens[match.start].start;
            match.end = tokens[match.end].end;
            match.text = utterance.substring(match.start, match.end + 1);
            results.push(match);
        }
    });
    // Return the results sorted by position in the utterance
    return results.sort((a, b) => a.start - b.start);
}
exports.findValues = findValues;
//# sourceMappingURL=findValues.js.map