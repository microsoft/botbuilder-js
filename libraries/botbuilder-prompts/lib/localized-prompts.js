"use strict";
/**
 * @module botbuilder-prompts
 */
/** second comment block */
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Finds the default prompts for a specific locale.
 *
 * @param locale Users preferred locale.
 * @param defaultLocale (Optional) default locale to use if users locale isn't supported. This defaults to 'en'.
 */
function find(locale, defaultLocale) {
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
exports.find = find;
const locales = {};
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
//# sourceMappingURL=localized-prompts.js.map