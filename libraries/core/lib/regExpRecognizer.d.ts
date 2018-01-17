/**
 * @module botbuilder
 */
/** second comment block */
import { Intent, IntentRecognizer } from './intentRecognizer';
export interface RegExpLocaleMap {
    [locale: string]: RegExp | RegExp[];
}
/** Optional settings for a `RegExpRecognizer`. */
export interface RegExpRecognizerSettings {
    /**
     * Minimum score, on a scale from 0.0 to 1.0, that should be returned for a matched
     * expression. This defaults to a value of 0.0.
     */
    minScore: number;
}
/**
 * An intent recognizer for detecting the users intent using a series of regular expressions.
 *
 * One of the primary advantages of using a RegExpRecognizer is that you can easily switch between
 * the use of regular expressions and a LUIS model. This could be useful for running unit tests
 * locally without having to make a cloud request.
 *
 * The other advantage for non-LUIS bots is that it potentially lets your bot support multiple
 * languages by providing a unique set of expressions for each language.
 *
 * **Usage Example**
 *
 * ```js
 * import { RegExpRecognizer } from 'botbuilder-core';
 *
 * // Define RegExp's for well known commands.
 * const recognizer = new RegExpRecognizer()
 *      .addIntent('HelpIntent', /^help/i)
 *      .addIntent('CancelIntent', /^cancel/i);
 *
 * // init bot and bind to adapter
 * const bot = new Bot(adapter);
 * // bind recognizer to bot
 * bot.use(recognizer);
 * // define bot's message handlers
 * bot.onReceive((context) => {
 *     if (context.ifIntent('HelpIntent')) {
 *         // handle help intent
 *         context.reply('You selected HelpIntent');
 *     } else if (context.ifIntent('CancelIntent')) {
 *        // handle cancel intent
 *        context.reply('You selected CancelIntent');
 *     } else {
 *        // handle all other messages
 *        context.reply('Welcome to the RegExpRecognizer example. Type "help" for commands, "cancel" to quit');
 *     }
 * });
 * ```
 */
export declare class RegExpRecognizer extends IntentRecognizer {
    private settings;
    private intents;
    /**
     * Creates a new instance of the recognizer.
     *
     * @param settings (Optional) settings to customize the recognizer.
     */
    constructor(settings?: Partial<RegExpRecognizerSettings>);
    /**
     * Adds a definition for a named intent to the recognizer.
     *
     * **Usage Example**
     *
     * ```js
     * // init recognizer
     * let foodRecognizer = new RegExpRecognizer();
     *
     * // add intents to recognizer
     * foodRecognizer.addIntent('TacosIntent', /taco/i);
     * foodRecognizer.addIntent('BurritosIntent', /burrito/i);
     * foodRecognizer.addIntent('EnchiladasIntent', /enchiladas/i);
     *
     * // add recognizer to bot
     * bot.use(foodRecognizer);
     * bot.onRecognize((context) => {
     *     if (context.ifIntent('TacosIntent')) {
     *         // handle tacos intent
     *         context.reply('Added one taco to your order');
     *     }
     *     else if (context.ifIntent('BurritosIntent')) {
     *         // handle burritos intent
     *         context.reply('Added one burrito to your order');
     *     }
     *     else if (context.ifIntent('EnchiladasIntent')) {
     *         // handle enchiladas intent
     *         context.reply('Added one enchilada to your order');
     *     }
     *     else {
     *        // handle other messages
     *     }
     * })
     * ```
     *
     * @param name Name of the intent to return when one of the expression(s) is matched.
     * @param expressions Expression(s) to match for this intent. Passing a `RegExpLocaleMap` lets
     * specify an alternate set of expressions for each language that your bot supports.
     */
    addIntent(name: string, expressions: RegExp | RegExp[] | RegExpLocaleMap): this;
    private getExpressions(context, map);
    /**
     * Matches a text string using the given expression. If matched, an `Intent` will be returned
     * containing a coverage score, from 0.0 to 1.0, indicating how much of the text matched
     * the expression. The more of the text the matched the greater the score. The name of
     * the intent will be the value of `expression.toString()` and any capture groups will be
     * returned as individual entities of type `string`.
     *
     * @param text The text string to match against.
     * @param expression The expression to match.
     * @param entityTypes (Optional) array of types to assign to each entity returned for a numbered
     * capture group. As an example, for the expression `/flight from (.*) to (.*)/i` you could
     * pass a value of `['fromCity', 'toCity']`. The entity returned for the first capture group will
     * have a type of `fromCity` and the entity for the second capture group will have a type of
     * `toCity`. The default entity type returned when not specified is `string`.
     * @param minScore (Optional) minimum score to return for the coverage score. The default value
     * is 0.0 but if provided, the calculated coverage score will be scaled to a value between the
     * minScore and 1.0. For example, a expression that matches 50% of the text will result in a
     * base coverage score of 0.5. If the minScore supplied is also 0.5 the returned score will be
     * scaled to be 0.75 or 50% between 0.5 and 1.0. As another example, providing a minScore of 1.0
     * will always result in a match returning a score of 1.0.
     */
    static recognize(text: string, expression: RegExp, entityTypes?: string[], minScore?: number): Intent | undefined;
}
