/**
 * @module botbuilder
 */
/** second comment block */
import { CardAction, Entity } from './activity';
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
export declare const EntityTypes: EntityTypes;
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
    synonyms?: string | string[];
}
/**
 * A set of utility functions to simplify the recognition of entities within a users utterance.
 */
export declare class EntityRecognizers {
    static numOrdinals: {
        [locale: string]: string[][];
    };
    static recognizeLocalizedRegExp(context: BotContext, expId: string): EntityObject<string>[];
    static recognizeLocalizedChoices(context: BotContext, listId: string, options?: RecognizeChoicesOptions): EntityObject<string>[];
    /**
     * Converts a list in "value1=synonym1,synonym2|value2" format to a `Choice` array.
     *
     * @param list Formatted list of choices to convert.
     */
    static toChoices(list: string): Choice[];
    /**
     * Recognizes any true/false or yes/no expressions in an utterance.
     *
     * @param context Context for the current turn of the conversation.
     */
    static recognizeBooleans(context: BotContext): EntityObject<boolean>[];
    /**
     * Recognizes any numbers mentioned in an utterance.
     *
     * @param context Context for the current turn of the conversation.
     * @param options (Optional) additional options to restrict the range of valid numbers that
     * will be recognized.
     */
    static recognizeNumbers(context: BotContext, options?: RecognizeNumbersOptions): EntityObject<number>[];
    /**
     * Recognizes any ordinals, like "the second one", mentioned in an utterance.
     *
     * @param context Context for the current turn of the conversation.
     */
    static recognizeOrdinals(context: BotContext): EntityObject<number>[];
    /**
     * Recognizes a set of choices (including synonyms) in an utterance.
     *
     * @param context Context for the current turn of the conversation.
     * @param choices Array of choices to match against.
     * @param options (Optional) additional options to customize the recognition.
     */
    static recognizeChoices(utterance: string, choices: Choice[], options?: RecognizeChoicesOptions): EntityObject<string>[];
    /**
     * Recognizes a set of values mentioned in an utterance. The zero based index of the match is returned.
     *
     * @param context Context for the current turn of the conversation.
     * @param value Array of values to match against. If a RegExp is provided the pattern will be matched
     * against the utterance.
     * @param options (Optional) additional options to customize the recognition that's performed.
     */
    static recognizeValues(utterance: string, values: (string | RegExp)[], options?: RecognizeValuesOptions): EntityObject<number>[];
    /**
     * Returns the entity with the highest score.
     *
     * @param entities List of entities to filter.
     */
    static findTopEntity<T>(entities: EntityObject<T>[]): EntityObject<T> | undefined;
    /** Calculates the coverage score for a recognized entity. */
    static coverageScore(utterance: string, entity: string, min?: number): number;
}
