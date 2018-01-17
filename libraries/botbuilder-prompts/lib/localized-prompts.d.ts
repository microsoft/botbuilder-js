/**
 * @module botbuilder-prompts
 */
/** second comment block */
import { Activity } from 'botbuilder-core';
export interface LocalizedPrompts {
    default_text: Partial<Activity>;
    default_number: Partial<Activity>;
    default_confirm: Partial<Activity>;
    default_choice: Partial<Activity>;
    default_time: Partial<Activity>;
    default_attachment: Partial<Activity>;
    number_minValue_error: Partial<Activity>;
    number_maxValue_error: Partial<Activity>;
    number_range_error: Partial<Activity>;
    number_integer_error: Partial<Activity>;
    list_or: string;
    list_or_more: string;
    confirm_yes: string;
    confirm_no: string;
}
/**
 * Finds the default prompts for a specific locale.
 *
 * @param locale Users preferred locale.
 * @param defaultLocale (Optional) default locale to use if users locale isn't supported. This defaults to 'en'.
 */
export declare function find(locale: string, defaultLocale?: string): LocalizedPrompts;
