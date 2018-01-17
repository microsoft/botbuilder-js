"use strict";
// 
// Copyright (c) Microsoft. All rights reserved.
// Licensed under the MIT license.
// 
// Microsoft Bot Framework: http://botframework.com
// 
// Bot Builder SDK Github:
// https://github.com/Microsoft/BotBuilder
// 
// Copyright (c) Microsoft Corporation
// All rights reserved.
// 
// MIT License:
// Permission is hereby granted, free of charge, to any person obtaining
// a copy of this software and associated documentation files (the
// "Software"), to deal in the Software without restriction, including
// without limitation the rights to use, copy, modify, merge, publish,
// distribute, sublicense, and/or sell copies of the Software, and to
// permit persons to whom the Software is furnished to do so, subject to
// the following conditions:
// 
// The above copyright notice and this permission notice shall be
// included in all copies or substantial portions of the Software.
// 
// THE SOFTWARE IS PROVIDED ""AS IS"", WITHOUT WARRANTY OF ANY KIND,
// EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
// MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
// NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE
// LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION
// OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION
// WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
//
Object.defineProperty(exports, "__esModule", { value: true });
var EntityRecognizer_1 = require("./EntityRecognizer");
var consts = require("../consts");
var breakingChars = " \n\r~`!@#$%^&*()-+={}|[]\\:\";'<>?,./";
var PromptRecognizers = /** @class */ (function () {
    function PromptRecognizers() {
    }
    PromptRecognizers.recognizeLocalizedRegExp = function (context, expId, namespace) {
        // Ensure cached
        var key = namespace + ':' + expId;
        var entities = [];
        var locale = context.preferredLocale();
        var utterance = context.message.text ? context.message.text.trim() : '';
        var cache = this.expCache[key];
        if (!cache) {
            this.expCache[key] = cache = {};
        }
        if (!cache.hasOwnProperty(locale)) {
            cache[locale] = new RegExp(context.localizer.gettext(locale, expId, namespace), 'ig');
        }
        // Recognize expression
        var matches = matchAll(cache[locale], utterance);
        matches.forEach(function (value) {
            entities.push({
                type: consts.Entities.String,
                entity: value,
                score: PromptRecognizers.calculateScore(utterance, value)
            });
        });
        // Return matches
        return entities;
    };
    PromptRecognizers.recognizeLocalizedChoices = function (context, listId, namespace, options) {
        // Ensure cached
        var key = namespace + ':' + listId;
        var entities = [];
        var locale = context.preferredLocale();
        var utterance = context.message.text ? context.message.text.trim() : '';
        var cache = this.choiceCache[key];
        if (!cache) {
            this.expCache[key] = cache = {};
        }
        if (!cache.hasOwnProperty(locale)) {
            // Map list to choices
            var list = context.localizer.gettext(locale, listId, namespace);
            cache[locale] = PromptRecognizers.toChoices(list);
        }
        // Call recognizeChoices() with cached choice list.
        return PromptRecognizers.recognizeChoices(context.message.text, cache[locale], options);
    };
    /** Converts a list in "value1=synonym1,synonym2|value2" format to an IChoice array. */
    PromptRecognizers.toChoices = function (list) {
        var choices = [];
        if (list) {
            list.split('|').forEach(function (value, index) {
                var pos = value.indexOf('=');
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
    };
    /** Recognizes any true/false or yes/no expressions in an utterance. */
    PromptRecognizers.recognizeBooleans = function (context) {
        // Recognize boolean expressions.
        var entities = [];
        var results = PromptRecognizers.recognizeLocalizedChoices(context, 'boolean_choices', consts.Library.system, { excludeValue: true });
        if (results) {
            results.forEach(function (result) {
                var value = (result.entity.entity === 'true');
                entities.push({
                    type: consts.Entities.Boolean,
                    entity: value,
                    score: result.score
                });
            });
        }
        return entities;
    };
    /** Recognizes any numbers mentioned in an utterance. */
    PromptRecognizers.recognizeNumbers = function (context, options) {
        function addEntity(n, score) {
            if ((typeof options.minValue !== 'number' || n >= options.minValue) &&
                (typeof options.maxValue !== 'number' || n <= options.maxValue) &&
                (!options.integerOnly || Math.floor(n) == n)) {
                entities.push({
                    type: consts.Entities.Number,
                    entity: n,
                    score: score
                });
            }
        }
        // Recognize any digit based numbers
        options = options || {};
        var entities = [];
        var matches = PromptRecognizers.recognizeLocalizedRegExp(context, 'number_exp', consts.Library.system);
        if (matches) {
            matches.forEach(function (entity) {
                var n = Number(entity.entity);
                addEntity(n, entity.score);
            });
        }
        // Recognize any term based numbers
        var results = PromptRecognizers.recognizeLocalizedChoices(context, 'number_terms', consts.Library.system, { excludeValue: true });
        if (results) {
            results.forEach(function (result) {
                var n = Number(result.entity.entity);
                addEntity(n, result.score);
            });
        }
        return entities;
    };
    /** Recognizes any ordinals, like "the second one", mentioned in an utterance. */
    PromptRecognizers.recognizeOrdinals = function (context) {
        // Recognize positive ordinals like "the first one"
        var entities = [];
        var results = PromptRecognizers.recognizeLocalizedChoices(context, 'number_ordinals', consts.Library.system, { excludeValue: true });
        if (results) {
            results.forEach(function (result) {
                var n = Number(result.entity.entity);
                entities.push({
                    type: consts.Entities.Number,
                    entity: n,
                    score: result.score
                });
            });
        }
        // Recognize reverse ordinals like "the last one"
        results = PromptRecognizers.recognizeLocalizedChoices(context, 'number_reverse_ordinals', consts.Library.system, { excludeValue: true });
        if (results) {
            results.forEach(function (result) {
                var n = Number(result.entity.entity);
                entities.push({
                    type: consts.Entities.Number,
                    entity: n,
                    score: result.score
                });
            });
        }
        return entities;
    };
    /** Recognizes a time or duration mentioned in an utterance. */
    PromptRecognizers.recognizeTimes = function (context, options) {
        options = options || {};
        var refData = options.refDate ? new Date(options.refDate) : null;
        var entities = [];
        var utterance = context.message.text ? context.message.text.trim() : '';
        var entity = EntityRecognizer_1.EntityRecognizer.recognizeTime(utterance, refData);
        if (entity) {
            entity.score = PromptRecognizers.calculateScore(utterance, entity.entity);
            entities.push(entity);
        }
        return entities;
    };
    /** Recognizes a set of choices (including synonyms) in an utterance. */
    PromptRecognizers.recognizeChoices = function (utterance, choices, options) {
        options = options || {};
        var entities = [];
        choices.forEach(function (choice, index) {
            // Build list of values to search over.
            var values = Array.isArray(choice.synonyms) ? choice.synonyms : (choice.synonyms || '').split('|');
            if (!options.excludeValue) {
                values.push(choice.value);
            }
            if (choice.action && !options.excludeAction) {
                var action = choice.action;
                if (action.title && action.title !== choice.value) {
                    values.push(action.title);
                }
                if (action.value && action.value !== choice.value && action.value !== action.title) {
                    values.push(action.value);
                }
            }
            // Recognize matched values.
            var match = PromptRecognizers.findTopEntity(PromptRecognizers.recognizeValues(utterance, values, options));
            if (match) {
                // Push the choice onto the list of matches. 
                entities.push({
                    type: consts.Entities.Match,
                    score: match.score,
                    entity: {
                        index: index,
                        entity: choice.value,
                        score: match.score
                    }
                });
            }
        });
        return entities;
    };
    /** Recognizes a set of values mentioned in an utterance. The zero based index of the match is returned. */
    PromptRecognizers.recognizeValues = function (utterance, values, options) {
        function indexOfToken(token, startPos) {
            for (var i = startPos; i < tokens.length; i++) {
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
            var matched = 0;
            var totalDeviation = 0;
            vTokens.forEach(function (token) {
                var pos = indexOfToken(token, startPos);
                if (pos >= 0) {
                    var distance = matched > 0 ? pos - startPos : 0;
                    if (distance <= maxDistance) {
                        matched++;
                        totalDeviation += distance;
                        startPos = pos + 1;
                    }
                }
            });
            // Calculate score
            var score = 0.0;
            if (matched > 0 && (matched == vTokens.length || options.allowPartialMatches)) {
                // Percentage of tokens matched. If matching "second last" in 
                // "the second from the last one" the completeness would be 1.0 since
                // all tokens were found.
                var completeness = matched / vTokens.length;
                // Accuracy of the match. In our example scenario the accuracy would 
                // be 0.5. 
                var accuracy = completeness * (matched / (matched + totalDeviation));
                // Calculate initial score on a scale from 0.0 - 1.0. For our example
                // we end up with an initial score of 0.166 because the utterance was
                // long and accuracy was low. We'll give this a boost in the next step.
                var initialScore = accuracy * (matched / tokens.length);
                // Calculate final score by changing the scale of the initial score from
                // 0.0 - 1.0 to 0.4 - 1.0. This will ensure that even a low score "can"
                // match. For our example we land on a final score of 0.4996.
                score = 0.4 + (0.6 * initialScore);
            }
            return score;
        }
        options = options || {};
        var entities = [];
        var text = utterance.trim().toLowerCase();
        var tokens = tokenize(text);
        var maxDistance = options.hasOwnProperty('maxTokenDistance') ? options.maxTokenDistance : 2;
        values.forEach(function (value, index) {
            if (typeof value === 'string') {
                // To match "last one" in "the last time I chose the last one" we need 
                // to recursively search the utterance starting from each token position.
                var topScore = 0.0;
                var vTokens = tokenize(value.trim().toLowerCase());
                for (var i = 0; i < tokens.length; i++) {
                    var score = matchValue(vTokens, i);
                    if (score > topScore) {
                        topScore = score;
                    }
                }
                if (topScore > 0.0) {
                    entities.push({
                        type: consts.Entities.Number,
                        entity: index,
                        score: topScore
                    });
                }
            }
            else {
                var matches = value.exec(text) || [];
                if (matches.length > 0) {
                    entities.push({
                        type: consts.Entities.Number,
                        entity: index,
                        score: PromptRecognizers.calculateScore(text, matches[0])
                    });
                }
            }
        });
        return entities;
    };
    /** Returns the entity with the highest score. */
    PromptRecognizers.findTopEntity = function (entities) {
        var top = null;
        if (entities) {
            entities.forEach(function (entity) {
                if (!top || entity.score > top.score) {
                    top = entity;
                }
            });
        }
        return top;
    };
    /** Returns the coverage score for a recognized entity. */
    PromptRecognizers.calculateScore = function (utterance, entity, max, min) {
        if (max === void 0) { max = 1.0; }
        if (min === void 0) { min = 0.5; }
        return Math.min(min + (entity.length / utterance.length), max);
    };
    PromptRecognizers.numOrdinals = {};
    PromptRecognizers.expCache = {};
    PromptRecognizers.choiceCache = {};
    return PromptRecognizers;
}());
exports.PromptRecognizers = PromptRecognizers;
/** Matches all occurences of an expression in a string. */
function matchAll(exp, text) {
    exp.lastIndex = 0;
    var matches = [];
    var match;
    while ((match = exp.exec(text)) != null) {
        matches.push(match[0]);
    }
    return matches;
}
/** Breaks a string of text into an array of tokens. */
function tokenize(text) {
    var tokens = [];
    if (text && text.length > 0) {
        var token = '';
        for (var i = 0; i < text.length; i++) {
            var chr = text[i];
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
