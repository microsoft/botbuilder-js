/**
 * @module botbuilder-choices
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */

import { Choice, findChoices, FoundChoice, FindChoicesOptions } from './findChoices';
import { ModelResult } from './modelResult';
import * as Recognizers from '@microsoft/recognizers-text-number';


export function recognizeChoices(utterance: string, choices: (string|Choice)[], options?: FindChoicesOptions): ModelResult<FoundChoice>[] {
    function matchChoiceByIndex(match: ModelResult<any>) {
        try {
            const index = parseInt(match.resolution.value) - 1;
            if (index >= 0 && index < list.length) {
                const choice = list[index];
                matched.push({
                    start: match.start,
                    end: match.end,
                    typeName: 'choice',
                    text: match.text,
                    resolution: {
                        value: choice.value,
                        index: index,
                        score: 1.0
                    }
                });
            }                
        } catch (e) { }
    }

    // Normalize choices
    const list: Choice[] = (choices || []).map((choice, index) => typeof choice === 'string' ? { value: choice } : choice);
    
    // Try finding choices by text search first
    // - We only want to use a single strategy for returning results to avoid issues where utterances 
    //   like the "the third one" or "the red one" or "the first division book" would miss-recognize as 
    //   a numerical index or ordinal as well.
    let matched = findChoices(utterance, list, options);
    if (matched.length === 0) {
        // Next try finding by ordinal
        const ordinals = Recognizers.recognizeOrdinal(utterance, 'en-us');
        if (ordinals.length > 0) {
            ordinals.forEach(matchChoiceByIndex);
        } else {
            // Finally try by numerical index
            Recognizers.recognizeNumber(utterance, 'en-us').forEach(matchChoiceByIndex);
        }

        // Sort any found matches by their position within the utterance.
        // - The results from findChoices() are already properly sorted so we just need this
        //   for ordinal & numerical lookups.
        matched = matched.sort((a,b) => a.start - b.start);
    }
    return matched;
}
