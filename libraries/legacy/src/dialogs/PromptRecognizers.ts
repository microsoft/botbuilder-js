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

import { IRecognizeContext } from './IntentRecognizer';
import { EntityRecognizer, IFindMatchResult } from './EntityRecognizer';
import * as consts from '../consts';
import * as chrono from 'chrono-node';

const breakingChars = " \n\r~`!@#$%^&*()-+={}|[]\\:\";'<>?,./";

export type StringOrRegExp = string|RegExp;

export interface IPromptRecognizeNumbersOptions {
    /** (Optional) minimum value allowed. */
    minValue?: number;

    /** (Optional) maximum value allowed. */
    maxValue?: number;

    /** (Optional) if true, then only integers will be recognized. */
    integerOnly?: boolean;
}

export interface IPromptRecognizeTimesOptions {
    /** (Optional) Reference date for releative times. */
    refDate?: number;
}

export interface IPromptRecognizeValuesOptions {
    /** 
     * (Optional) if true, then only some of the tokens in a value need to exist to be considered 
     * a match. The default value is "false".
     */
    allowPartialMatches?: boolean;

    /** 
     * (Optional) maximum tokens allowed between two matched tokens in the utterance. So with
     * a max distance of 2 the value "second last" would match the utternace "second from the last"
     * but it wouldn't match "Wait a second. That's not the last one is it?". 
     * The default value is "2".  
     */
    maxTokenDistance?: number;
}

export interface IPromptRecognizeChoicesOptions extends IPromptRecognizeValuesOptions {
    /** (Optional) If true, the choices value will NOT be recognized over. */
    excludeValue?: boolean;

    /** (Optional) If true, the choices action will NOT be recognized over. */
    excludeAction?: boolean;
}

export interface IChronoDuration extends IEntity<string> {
    resolution: {
        start: Date;
        end?: Date;
        ref?: Date;
    };
}

export interface IChoice {
    /** Value to return when selected.  */
    value: string;

    /** (Optional) action to use when rendering the choice as a suggested action. */
    action?: ICardAction;

    /** (Optional) list of synonyms to recognize in addition to the value. */
    synonyms?: string|string[];
}

interface ILocalizedCache<T> {
    [id:string]: {
        [locale:string]: T;
    };
}

export class PromptRecognizers {
    static numOrdinals: { [locale:string]: string[][]; } = {};
    static expCache: ILocalizedCache<RegExp> = {};
    static choiceCache: ILocalizedCache<IChoice[]> = {};

    static recognizeLocalizedRegExp(context: IRecognizeContext, expId: string, namespace: string): IEntity<string>[] {
        // Ensure cached
        let key = namespace + ':' + expId;
        let entities: IEntity<string>[] = [];
        const locale = context.preferredLocale();
        const utterance = context.message.text ? context.message.text.trim() : '';
        let cache = this.expCache[key];
        if (!cache) {
            this.expCache[key] = cache = {};
        }
        if (!cache.hasOwnProperty(locale)) {
            cache[locale] = new RegExp(context.localizer.gettext(locale, expId, namespace), 'ig');
        }

        // Recognize expression
        let matches = matchAll(cache[locale], utterance);
        matches.forEach((value) => {
            entities.push({
                type: consts.Entities.String,
                entity: value,
                score: PromptRecognizers.calculateScore(utterance, value)
            });
        });

        // Return matches
        return entities;
    }

    static recognizeLocalizedChoices(context: IRecognizeContext, listId: string, namespace: string, options?: IPromptRecognizeChoicesOptions): IEntity<IFindMatchResult>[] {
        // Ensure cached
        let key = namespace + ':' + listId;
        let entities: IEntity<string>[] = [];
        const locale = context.preferredLocale();
        const utterance = context.message.text ? context.message.text.trim() : '';
        let cache = this.choiceCache[key];
        if (!cache) {
            this.expCache[key] = cache = {};
        }
        if (!cache.hasOwnProperty(locale)) {
            // Map list to choices
            let list = context.localizer.gettext(locale, listId, namespace);
            cache[locale] = PromptRecognizers.toChoices(list);
        }

        // Call recognizeChoices() with cached choice list.
        return PromptRecognizers.recognizeChoices(context.message.text, cache[locale], options);
    }

    /** Converts a list in "value1=synonym1,synonym2|value2" format to an IChoice array. */
    static toChoices(list: string): IChoice[] {
        let choices: IChoice[] = [];
        if (list) {
            list.split('|').forEach((value, index) => {
                let pos = value.indexOf('=');
                if (pos > 0) {
                    choices.push({
                        value: value.substr(0, pos),
                        synonyms: value.substr(pos + 1).split(',')
                    });
                } else {
                    choices.push({
                        value: value,
                        synonyms: []
                    });
                }
            });
        }
        return choices;
    }

    /** Recognizes any true/false or yes/no expressions in an utterance. */
    static recognizeBooleans(context: IRecognizeContext): IEntity<boolean>[] {
        // Recognize boolean expressions.
        let entities: IEntity<boolean>[] = [];
        let results = PromptRecognizers.recognizeLocalizedChoices(context, 'boolean_choices', consts.Library.system, { excludeValue: true });
        if (results) {
            results.forEach((result) => {
                let value = (result.entity.entity === 'true');
                entities.push({
                    type: consts.Entities.Boolean,
                    entity: value,
                    score: result.score
                });
            });
        }
        return entities;
    }
    
    /** Recognizes any numbers mentioned in an utterance. */
    static recognizeNumbers(context: IRecognizeContext, options?: IPromptRecognizeNumbersOptions): IEntity<number>[] {
        function addEntity(n: number, score: number) {
            if ((typeof options.minValue !== 'number' || n >= options.minValue) &&
                (typeof options.maxValue !== 'number' || n <= options.maxValue) &&
                (!options.integerOnly || Math.floor(n) == n)) 
            {
                entities.push({
                    type: consts.Entities.Number,
                    entity: n,
                    score: score
                });
            }
        }
        
        // Recognize any digit based numbers
        options = options || {};
        let entities: IEntity<number>[] = [];
        let matches = PromptRecognizers.recognizeLocalizedRegExp(context, 'number_exp', consts.Library.system);
        if (matches) {
            matches.forEach((entity) => {
                let n = Number(entity.entity);
                addEntity(n, entity.score);
            });
        }

        // Recognize any term based numbers
        let results = PromptRecognizers.recognizeLocalizedChoices(context, 'number_terms', consts.Library.system, { excludeValue: true });
        if (results) {
            results.forEach((result) => {
                let n = Number(result.entity.entity);
                addEntity(n, result.score);
            });
        }
        return entities;
    }

    /** Recognizes any ordinals, like "the second one", mentioned in an utterance. */
    static recognizeOrdinals(context: IRecognizeContext): IEntity<number>[] {
        // Recognize positive ordinals like "the first one"
        let entities: IEntity<number>[] = [];
        let results = PromptRecognizers.recognizeLocalizedChoices(context, 'number_ordinals', consts.Library.system, { excludeValue: true });
        if (results) {
            results.forEach((result) => {
                let n = Number(result.entity.entity);
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
            results.forEach((result) => {
                let n = Number(result.entity.entity);
                entities.push({
                    type: consts.Entities.Number,
                    entity: n,
                    score: result.score
                });
            });
        }

        return entities;
    }

    /** Recognizes a time or duration mentioned in an utterance. */
    static recognizeTimes(context: IRecognizeContext, options?: IPromptRecognizeTimesOptions): IEntity<string>[]  {
        options = options || {};
        let refData = options.refDate ? new Date(options.refDate) : null;
        let entities: IEntity<string>[] = [];
        const utterance = context.message.text ? context.message.text.trim() : '';
        let entity = EntityRecognizer.recognizeTime(utterance, refData);
        if (entity) {
            entity.score = PromptRecognizers.calculateScore(utterance, entity.entity);
            entities.push(entity);
        }
        return entities;
    }

    /** Recognizes a set of choices (including synonyms) in an utterance. */
    static recognizeChoices(utterance: string, choices: IChoice[], options?: IPromptRecognizeChoicesOptions): IEntity<IFindMatchResult>[] {
        options = options || {};
        let entities: IEntity<IFindMatchResult>[] = [];
        choices.forEach((choice, index) => {
            // Build list of values to search over.
            let values = Array.isArray(choice.synonyms) ? choice.synonyms : (choice.synonyms || '').split('|');
            if (!options.excludeValue) {
                values.push(choice.value);
            }
            if (choice.action && !options.excludeAction) {
                let action = choice.action;
                if (action.title && action.title !== choice.value) {
                    values.push(action.title);
                }
                if (action.value && action.value !== choice.value && action.value !== action.title) {
                    values.push(action.value);
                }
            }

            // Recognize matched values.
            let match = PromptRecognizers.findTopEntity(PromptRecognizers.recognizeValues(utterance, values, options));
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
    }

    /** Recognizes a set of values mentioned in an utterance. The zero based index of the match is returned. */
    static recognizeValues(utterance: string, values: StringOrRegExp[], options?: IPromptRecognizeValuesOptions): IEntity<number>[] {
        function indexOfToken(token: string, startPos: number): number {
            for (let i = startPos; i < tokens.length; i++) {
                if (tokens[i] === token) {
                    return i;
                }
            }
            return -1;
        }

        function matchValue(vTokens: string[], startPos: number): number {
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
            if (matched > 0 && (matched == vTokens.length || options.allowPartialMatches)) {
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
         
        options = options || {};
        let entities: IEntity<number>[] = [];
        let text = utterance.trim().toLowerCase();
        let tokens = tokenize(text);
        let maxDistance = options.hasOwnProperty('maxTokenDistance') ? options.maxTokenDistance : 2;
        values.forEach((value, index) => {
            if (typeof value === 'string') {
                // To match "last one" in "the last time I chose the last one" we need 
                // to recursively search the utterance starting from each token position.
                let topScore = 0.0;
                let vTokens = tokenize((<string>value).trim().toLowerCase());
                for (let i = 0; i < tokens.length; i++) {
                    let score = matchValue(vTokens, i);
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
            } else {
                let matches = (<RegExp>value).exec(text) || <string[]>[];
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
    }

    /** Returns the entity with the highest score. */
    static findTopEntity<T>(entities: IEntity<T>[]): IEntity<T> {
        let top: IEntity<T> = null;
        if (entities) {
            entities.forEach((entity) => {
                if (!top || entity.score > top.score) {
                    top = entity; 
                }
            });
        }
        return top;
    } 

    /** Returns the coverage score for a recognized entity. */
    static calculateScore(utterance: string, entity: string, max = 1.0, min = 0.5): number {
        return Math.min(min + (entity.length / utterance.length), max);
    }
}

/** Matches all occurences of an expression in a string. */
function matchAll(exp: RegExp, text: string): string[] {
    exp.lastIndex = 0;
    let matches: string[] = [];
    let match: string[];
    while ((match = exp.exec(text)) != null) {
        matches.push(match[0]);
    }
    return matches;
}

/** Breaks a string of text into an array of tokens. */
function tokenize(text: string): string[] {
    let tokens: string[] = [];
    if (text && text.length > 0) {
        let token = '';
        for (let i = 0; i < text.length; i++) {
            const chr = text[i];
            if (breakingChars.indexOf(chr) >= 0) {
                if (token.length > 0) {
                    tokens.push(token);
                }
                token = '';
            } else {
                token += chr;
            }
        }
        if (token.length > 0) {
            tokens.push(token);
        }
    }
    return tokens;
}

