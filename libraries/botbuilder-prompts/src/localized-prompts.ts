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
export function find(locale: string, defaultLocale?: string): LocalizedPrompts
{
    if (!defaultLocale) {
        defaultLocale = 'en';
    }
    if (!locale) {
        locale = defaultLocale;
    }
    const pos = locale.indexOf('-');
    const parentLocale = pos > 0 ? locale.substr(0, pos) : locale;
    return locales[locale] || locales[parentLocale] || locales[defaultLocale] || locales['en'];
}
const locales: { [locale: string]: LocalizedPrompts; } = {};

locales['en'] = {
    default_text: { type: 'message', text: "I didn't understand. Please try again." },
    default_number: { type: 'message', text: "I didn't recognize that as a number. Please enter a number." },
    default_confirm: { type: 'message', text: "I didn't understand. Please answer 'yes' or 'no'." },
    default_choice: { type: 'message', text: "I didn't understand. Please choose an option from the list." },
    default_time: { type: 'message', text: "I didn't recognize the time you entered. Please try again using a format of (MM/DD/YYYY HH:MM:SS)." },
    default_attachment: { type: 'message', text: "I didn't receive a file. Please try again." },
    number_minValue_error: { type: 'message', text: "The number you entered was below the minimum allowed value of ${minValue}. Please enter a valid number." },
    number_maxValue_error: { type: 'message', text: "The number you entered was above the maximum allowed value of ${maxValue}. Please enter a valid number." },
    number_range_error: { type: 'message', text: "The number you entered was outside the allowed range of ${minValue} to ${maxValue}. Please enter a valid number." },
    number_integer_error: { type: 'message', text: "The number you entered was not an integer. Please enter a number without a decimal mark." },
    list_or: " or ",
    list_or_more: ", or ",
    confirm_yes: "yes",
    confirm_no: "no"
};