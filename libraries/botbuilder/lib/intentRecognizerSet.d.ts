/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { IntentRecognizer } from './intentRecognizer';
export declare enum RecognizeOrder {
    parallel = 0,
    series = 1,
}
/** Optional settings for an `IntentRecognizerSet`. */
export interface IntentRecognizerSetSettings {
    /**
     * (Optional) preferred order in which the sets recognizers should be run. The default value
     * is `RecognizeOrder.parallel`.
     */
    recognizeOrder?: RecognizeOrder;
    /**
     * (Optional) if `true` and the [recognizeOrder](#recognizeorder) is `RecognizeOrder.series`,
     * the execution of recognizers will be short circuited should a recognizer return an intent
     * with a score of 1.0.  The default value is `true`.
     */
    stopOnExactMatch?: boolean;
}
/**
 * Optimizes the execution of multiple intent recognizers. An intent recognizer set can be
 * configured to execute its recognizers either in parallel (the default) or in series. The
 * output of the set will be a single intent that had the highest score.
 *
 * The intent recognizer set is itself an intent recognizer which means that it can be
 * conditionally disabled or have its output filtered just like any other recognizer. It can
 * even be composed into other recognizer sets allowing for sophisticated recognizer
 * hierarchies to be created.
 *
 * **Usage Example**
 *
 * ```js
 * // Define RegExp's for well known commands.
 * const recognizer = new RegExpRecognizer({ minScore: 1.0 })
 *      .addIntent('HelpIntent', /^help/i)
 *      .addIntent('CancelIntent', /^cancel/i);
 *
 * // Create a set that will only call LUIS for unknown commands.
 * const recognizerSet = new IntentRecognizerSet({ recognizeOrder: RecognizeOrder.series })
 *      .add(recognizer)
 *      .add(new LuisRecognizer('Model ID', 'Subscription Key'));
 *
 * // Add set to bot.
 * const bot = new Bot(adapter)
 *      .use(recognizerSet)
 *      .onReceive((context) => {
 *          if (context.ifIntent('HelpIntent')) {
 *              // ... help
 *          } else if (context.ifIntent('CancelIntent')) {
 *              // ... cancel
 *          } else {
 *              // ... default logic
 *          }
 *      });
 * ```
 */
export declare class IntentRecognizerSet extends IntentRecognizer {
    private settings;
    private recognizers;
    /**
     * Creates a new instance of a recognizer set.
     *
     * @param settings (Optional) settings to customize the sets execution strategy.
     */
    constructor(settings?: IntentRecognizerSetSettings);
    /**
     * Adds recognizer(s) to the set. Recognizers will be evaluated in the order they're
     * added to the set.
     *
     * @param recognizers One or more recognizers to add to the set.
     */
    add(...recognizers: IntentRecognizer[]): this;
    private recognizeInParallel(context);
    private recognizeInSeries(context);
    private hasExactMatch(intents);
}
