"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const entityRules = require("./localized-entities");
const breakingChars = " \n\r~`!@#$%^&*()-+={}|[]\\:\";'<>?,./";
/** Well known entity types. */
exports.EntityTypes = {
    attachment: 'attachment',
    string: 'string',
    number: 'number',
    boolean: 'boolean'
};
/**
 * A set of utility functions to simplify the recognition of entities within a users utterance.
 */
class EntityRecognizers {
    static recognizeLocalizedRegExp(context, expId) {
        // Lookup expression
        let exp = undefined;
        const entities = [];
        const locale = context.request.locale || 'en';
        const utterance = context.request.text ? context.request.text.trim() : '';
        const rules = entityRules.find(locale);
        if (rules && rules.hasOwnProperty(expId)) {
            exp = rules[expId];
        }
        // Recognize expression
        if (exp) {
            let matches = matchAll(exp, utterance);
            matches.forEach((value) => {
                entities.push({
                    type: exports.EntityTypes.string,
                    value: value,
                    score: EntityRecognizers.coverageScore(utterance, value)
                });
            });
        }
        // Return matches
        return entities;
    }
    static recognizeLocalizedChoices(context, listId, options) {
        // Ensure cached
        const locale = context.request.locale || 'en';
        const utterance = context.request.text ? context.request.text.trim() : '';
        let cache = choiceCache[listId];
        if (!cache) {
            choiceCache[listId] = cache = {};
        }
        let choices = cache[locale];
        if (!choices) {
            // Map list to choices and cache
            const rules = entityRules.find(locale);
            if (rules && rules.hasOwnProperty(listId)) {
                cache[locale] = choices = EntityRecognizers.toChoices(rules[listId]);
            }
        }
        // Call recognizeChoices() with cached choice list.
        return choices ? EntityRecognizers.recognizeChoices(utterance, choices, options) : [];
    }
    /**
     * Converts a list in "value1=synonym1,synonym2|value2" format to a `Choice` array.
     *
     * @param list Formatted list of choices to convert.
     */
    static toChoices(list) {
        let choices = [];
        if (list) {
            list.split('|').forEach((value, index) => {
                let pos = value.indexOf('=');
                if (pos > 0) {
                    choices.push({
                        value: value.substr(0, pos),
                        synonyms: value.substr(pos + 1).split(',')
                    });
                }
                else {
                    choices.push({
                        value: value,
                        synonyms: []
                    });
                }
            });
        }
        return choices;
    }
    /**
     * Recognizes any true/false or yes/no expressions in an utterance.
     *
     * @param context Context for the current turn of the conversation.
     */
    static recognizeBooleans(context) {
        // Recognize boolean expressions.
        let entities = [];
        let results = EntityRecognizers.recognizeLocalizedChoices(context, 'boolean_choices', { excludeValue: true });
        if (results) {
            results.forEach((result) => {
                let value = (result.value === 'true');
                entities.push({
                    type: exports.EntityTypes.boolean,
                    value: value,
                    score: result.score
                });
            });
        }
        return entities;
    }
    /**
     * Recognizes any numbers mentioned in an utterance.
     *
     * @param context Context for the current turn of the conversation.
     * @param options (Optional) additional options to restrict the range of valid numbers that
     * will be recognized.
     */
    static recognizeNumbers(context, options) {
        function addEntity(n, score) {
            if ((typeof opt.minValue !== 'number' || n >= opt.minValue) &&
                (typeof opt.maxValue !== 'number' || n <= opt.maxValue) &&
                (!opt.integerOnly || Math.floor(n) == n)) {
                entities.push({
                    type: exports.EntityTypes.number,
                    value: n,
                    score: score
                });
            }
        }
        // Recognize any digit based numbers
        const opt = options || {};
        let entities = [];
        let matches = EntityRecognizers.recognizeLocalizedRegExp(context, 'number_exp');
        if (matches) {
            matches.forEach((entity) => {
                let n = Number(entity.value);
                addEntity(n, entity.score);
            });
        }
        // Recognize any term based numbers
        let results = EntityRecognizers.recognizeLocalizedChoices(context, 'number_terms', { excludeValue: true });
        if (results) {
            results.forEach((result) => {
                let n = Number(result.value);
                addEntity(n, result.score);
            });
        }
        return entities;
    }
    /**
     * Recognizes any ordinals, like "the second one", mentioned in an utterance.
     *
     * @param context Context for the current turn of the conversation.
     */
    static recognizeOrdinals(context) {
        // Recognize positive ordinals like "the first one"
        let entities = [];
        let results = EntityRecognizers.recognizeLocalizedChoices(context, 'number_ordinals', { excludeValue: true });
        if (results) {
            results.forEach((result) => {
                let n = Number(result.value);
                entities.push({
                    type: exports.EntityTypes.number,
                    value: n,
                    score: result.score
                });
            });
        }
        // Recognize reverse ordinals like "the last one"
        results = EntityRecognizers.recognizeLocalizedChoices(context, 'number_reverse_ordinals', { excludeValue: true });
        if (results) {
            results.forEach((result) => {
                let n = Number(result.value);
                entities.push({
                    type: exports.EntityTypes.number,
                    value: n,
                    score: result.score
                });
            });
        }
        return entities;
    }
    /**
     * Recognizes a set of choices (including synonyms) in an utterance.
     *
     * @param context Context for the current turn of the conversation.
     * @param choices Array of choices to match against.
     * @param options (Optional) additional options to customize the recognition.
     */
    static recognizeChoices(utterance, choices, options) {
        const opt = options || {};
        let entities = [];
        choices.forEach((choice, index) => {
            // Build list of values to search over.
            let values = Array.isArray(choice.synonyms) ? choice.synonyms : (choice.synonyms || '').split('|');
            if (!opt.excludeValue) {
                values.push(choice.value);
            }
            if (choice.action && !opt.excludeAction) {
                let action = choice.action;
                if (action.title && action.title !== choice.value) {
                    values.push(action.title);
                }
                if (action.value && action.value !== choice.value && action.value !== action.title) {
                    values.push(action.value);
                }
            }
            // Recognize matched values.
            let match = EntityRecognizers.findTopEntity(EntityRecognizers.recognizeValues(utterance, values, options));
            if (match) {
                // Push the choice onto the list of matches. 
                entities.push({
                    type: exports.EntityTypes.string,
                    score: match.score,
                    value: choice.value
                });
            }
        });
        return entities;
    }
    /**
     * Recognizes a set of values mentioned in an utterance. The zero based index of the match is returned.
     *
     * @param context Context for the current turn of the conversation.
     * @param value Array of values to match against. If a RegExp is provided the pattern will be matched
     * against the utterance.
     * @param options (Optional) additional options to customize the recognition that's performed.
     */
    static recognizeValues(utterance, values, options) {
        function indexOfToken(token, startPos) {
            for (let i = startPos; i < tokens.length; i++) {
                if (tokens[i] === token) {
                    return i;
                }
            }
            return -1;
        }
        function matchValue(vTokens, startPos) {
            // Match value to utterance 
            // - The tokens are matched in order so "second last" will match in 
            //   "the second from last one" but not in "the last from the second one".
            let matched = 0;
            let totalDeviation = 0;
            vTokens.forEach((token) => {
                let pos = indexOfToken(token, startPos);
                if (pos >= 0) {
                    let distance = matched > 0 ? pos - startPos : 0;
                    if (distance <= maxDistance) {
                        matched++;
                        totalDeviation += distance;
                        startPos = pos + 1;
                    }
                }
            });
            // Calculate score
            let score = 0.0;
            if (matched > 0 && (matched == vTokens.length || opt.allowPartialMatches)) {
                // Percentage of tokens matched. If matching "second last" in 
                // "the second from the last one" the completeness would be 1.0 since
                // all tokens were found.
                let completeness = matched / vTokens.length;
                // Accuracy of the match. In our example scenario the accuracy would 
                // be 0.5. 
                let accuracy = completeness * (matched / (matched + totalDeviation));
                // Calculate initial score on a scale from 0.0 - 1.0. For our example
                // we end up with an initial score of 0.166 because the utterance was
                // long and accuracy was low. We'll give this a boost in the next step.
                let initialScore = accuracy * (matched / tokens.length);
                // Calculate final score by changing the scale of the initial score from
                // 0.0 - 1.0 to 0.4 - 1.0. This will ensure that even a low score "can"
                // match. For our example we land on a final score of 0.4996.
                score = 0.4 + (0.6 * initialScore);
            }
            return score;
        }
        let opt = options || {};
        let entities = [];
        let text = utterance.trim().toLowerCase();
        let tokens = tokenize(text);
        let maxDistance = opt.hasOwnProperty('maxTokenDistance') ? opt.maxTokenDistance : 2;
        values.forEach((value, index) => {
            if (typeof value === 'string') {
                // To match "last one" in "the last time I chose the last one" we need 
                // to recursively search the utterance starting from each token position.
                let topScore = 0.0;
                let vTokens = tokenize(value.trim().toLowerCase());
                for (let i = 0; i < tokens.length; i++) {
                    let score = matchValue(vTokens, i);
                    if (score > topScore) {
                        topScore = score;
                    }
                }
                if (topScore > 0.0) {
                    entities.push({
                        type: exports.EntityTypes.number,
                        value: index,
                        score: topScore
                    });
                }
            }
            else {
                let matches = value.exec(text) || [];
                if (matches.length > 0) {
                    entities.push({
                        type: exports.EntityTypes.number,
                        value: index,
                        score: EntityRecognizers.coverageScore(text, matches[0])
                    });
                }
            }
        });
        return entities;
    }
    /**
     * Returns the entity with the highest score.
     *
     * @param entities List of entities to filter.
     */
    static findTopEntity(entities) {
        let top;
        if (entities) {
            entities.forEach((entity) => {
                if (entity && entity.score && (!top || entity.score > top.score)) {
                    top = entity;
                }
            });
        }
        return top;
    }
    /** Calculates the coverage score for a recognized entity. */
    static coverageScore(utterance, entity, min) {
        if (min === undefined) {
            min = 0.4;
        }
        ;
        const coverage = (entity.length / utterance.length);
        return min + (coverage * (1.0 - min));
    }
}
EntityRecognizers.numOrdinals = {};
exports.EntityRecognizers = EntityRecognizers;
/** Matches all occurrences of an expression in a string. */
function matchAll(exp, text) {
    exp.lastIndex = 0;
    let matches = [];
    let match;
    while ((match = exp.exec(text)) != null) {
        matches.push(match[0]);
    }
    return matches;
}
/** Breaks a string of text into an array of tokens. */
function tokenize(text) {
    let tokens = [];
    if (text && text.length > 0) {
        let token = '';
        for (let i = 0; i < text.length; i++) {
            const chr = text[i];
            if (breakingChars.indexOf(chr) >= 0) {
                if (token.length > 0) {
                    tokens.push(token);
                }
                token = '';
            }
            else {
                token += chr;
            }
        }
        if (token.length > 0) {
            tokens.push(token);
        }
    }
    return tokens;
}
const expCache = {};
const choiceCache = {};
//# sourceMappingURL=entityRecognizers.js.map