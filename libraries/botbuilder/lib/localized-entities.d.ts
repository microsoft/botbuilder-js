/**
 * @module botbuilder
 */
/** second comment block */
export interface LocalizedEntities {
    boolean_choices: string;
    number_exp: RegExp;
    number_terms: string;
    number_ordinals: string;
    number_reverse_ordinals: string;
}
/**
 * Finds the entity parsing rules for a specific locale.
 *
 * @param locale Users preferred locale.
 * @param defaultLocale (Optional) default locale to use if users locale isn't supported. This defaults to 'en'.
 */
export declare function find(locale: string, defaultLocale?: string): LocalizedEntities | undefined;
