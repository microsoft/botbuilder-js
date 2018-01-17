/**
 * @module botbuilder
 */
/** second comment block */
import { CardAction, Entity } from './activity';
import * as entityRules from './localized-entities';

const breakingChars = " \n\r~`!@#$%^&*()-+={}|[]\\:\";'<>?,./";


/**
 * A strongly typed entity.
 */
export interface EntityObject<T> extends Entity {
    /** Type of entity */
    type: string;

    /** Value of the entity. */
    value: T;

    /** (Optional) the recognizers confidence that this entity matches the users intent. */
    score?: number;
}

/** Well known entity types. */
export const EntityTypes: EntityTypes = {
    attachment: 'attachment',
    string: 'string',
    number: 'number',
    boolean: 'boolean'
};

export interface RecognizeNumbersOptions {
    /** (Optional) minimum value allowed. */
    minValue?: number;

    /** (Optional) maximum value allowed. */
    maxValue?: number;

    /** (Optional) if true, then only integers will be recognized. */
    integerOnly?: boolean;
}

export interface RecognizeValuesOptions {
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

export interface RecognizeChoicesOptions extends RecognizeValuesOptions {
    /** (Optional) If true, the choices value will NOT be recognized over. */
    excludeValue?: boolean;

    /** (Optional) If true, the choices action will NOT be recognized over. */
    excludeAction?: boolean;
}

export interface Choice {
    /** Value to return when selected.  */
    value: string;

    /** (Optional) action to use when rendering the choice as a suggested action. */
    action?: CardAction;

    /** (Optional) list of synonyms to recognize in addition to the value. */
    synonyms?: string|string[];
}

/**
 * A set of utility functions to simplify the recognition of entities within a users utterance.
 */
export class EntityRecognizers {
    static numOrdinals: { [locale:string]: string[][]; } = {};

    static recognizeLocalizedRegExp(context: BotContext, expId: string): EntityObject<string>[] {
        // Lookup expression
        let exp: RegExp|undefined = undefined;
        const entities: EntityObject<string>[] = [];
        const locale = context.request.locale || 'en';
        const utterance = context.request.text ? context.request.text.trim() : '';
        const rules = entityRules.find(locale);
        if (rules && rules.hasOwnProperty(expId)) {
            exp = (<any>rules)[expId];
        }

        // Recognize expression
        if (exp) {
            let matches = matchAll(exp, utterance);
            matches.forEach((value) => {
                entities.push({
                    type: EntityTypes.string,
                    value: value,
                    score: EntityRecognizers.coverageScore(utterance, value)
                });
            });

        }

        // Return matches
        return entities;
    }

    static recognizeLocalizedChoices(context: BotContext, listId: string, options?: RecognizeChoicesOptions): EntityObject<string>[] {
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
                cache[locale] = choices = EntityRecognizers.toChoices((<any>rules)[listId]);
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
    static toChoices(list: string): Choice[] {
        let choices: Choice[] = [];
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

    /** 
     * Recognizes any true/false or yes/no expressions in an utterance.
     *
     * @param context Context for the current turn of the conversation.
     */
    static recognizeBooleans(context: BotContext): EntityObject<boolean>[] {
        // Recognize boolean expressions.
        let entities: EntityObject<boolean>[] = [];
        let results = EntityRecognizers.recognizeLocalizedChoices(context, 'boolean_choices', { excludeValue: true });
        if (results) {
            results.forEach((result) => {
                let value = (result.value === 'true');
                entities.push({
                    type: EntityTypes.boolean,
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
    static recognizeNumbers(context: BotContext, options?: RecognizeNumbersOptions): EntityObject<number>[] {
        function addEntity(n: number, score: number) {
            if ((typeof opt.minValue !== 'number' || n >= opt.minValue) &&
                (typeof opt.maxValue !== 'number' || n <= opt.maxValue) &&
                (!opt.integerOnly || Math.floor(n) == n)) 
            {
                entities.push({
                    type: EntityTypes.number,
                    value: n,
                    score: score
                });
            }
        }
        
        // Recognize any digit based numbers
        const opt = options || {};
        let entities: EntityObject<number>[] = [];
        let matches = EntityRecognizers.recognizeLocalizedRegExp(context, 'number_exp');
        if (matches) {
            matches.forEach((entity) => {
                let n = Number(entity.value);
                addEntity(n, <number>entity.score);
            });
        }

        // Recognize any term based numbers
        let results = EntityRecognizers.recognizeLocalizedChoices(context, 'number_terms', { excludeValue: true });
        if (results) {
            results.forEach((result) => {
                let n = Number(result.value);
                addEntity(n, <number>result.score);
            });
        }
        return entities;
    }

    /** 
     * Recognizes any ordinals, like "the second one", mentioned in an utterance.
     *
     * @param context Context for the current turn of the conversation.
     */
    static recognizeOrdinals(context: BotContext): EntityObject<number>[] {
        // Recognize positive ordinals like "the first one"
        let entities: EntityObject<number>[] = [];
        let results = EntityRecognizers.recognizeLocalizedChoices(context, 'number_ordinals', { excludeValue: true });
        if (results) {
            results.forEach((result) => {
                let n = Number(result.value);
                entities.push({
                    type: EntityTypes.number,
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
                    type: EntityTypes.number,
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
    static recognizeChoices(utterance: string, choices: Choice[], options?: RecognizeChoicesOptions): EntityObject<string>[] {
        const opt = options || {};
        let entities: EntityObject<string>[] = [];
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
                    type: EntityTypes.string,
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
    static recognizeValues(utterance: string, values: (string|RegExp)[], options?: RecognizeValuesOptions): EntityObject<number>[] {
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
        let entities: EntityObject<number>[] = [];
        let text = utterance.trim().toLowerCase();
        let tokens = tokenize(text);
        let maxDistance = opt.hasOwnProperty('maxTokenDistance') ? <number>opt.maxTokenDistance : 2;
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
                        type: EntityTypes.number,
                        value: index,
                        score: topScore
                    });
                }
            } else {
                let matches = (<RegExp>value).exec(text) || <string[]>[];
                if (matches.length > 0) {
                    entities.push({
                        type: EntityTypes.number,
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
    static findTopEntity<T>(entities: EntityObject<T>[]): EntityObject<T>|undefined {
        let top: EntityObject<T>|undefined;
        if (entities) {
            entities.forEach((entity) => {
                if (entity && entity.score && (!top || entity.score > <number>top.score)) {
                    top = entity; 
                }
            });
        }
        return top;
    } 

    /** Calculates the coverage score for a recognized entity. */
    static coverageScore(utterance: string, entity: string, min?: number): number {
        if (min === undefined) { min = 0.4 };
        const coverage = (entity.length / utterance.length);
        return min + (coverage * (1.0 - min));
    }
}

/** Matches all occurrences of an expression in a string. */
function matchAll(exp: RegExp, text: string): string[] {
    exp.lastIndex = 0;
    let matches: string[] = [];
    let match: RegExpExecArray|null;
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


interface LocalizedCache<T> {
    [id:string]: {
        [locale:string]: T;
    };
}
const expCache: LocalizedCache<RegExp> = {};
const choiceCache: LocalizedCache<Choice[]> = {};
