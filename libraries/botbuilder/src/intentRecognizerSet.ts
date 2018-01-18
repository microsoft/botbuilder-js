/**
 * @module botbuilder
 */
/** second comment block */
import { Intent, IntentRecognizer } from './intentRecognizer';

export enum RecognizeOrder { parallel, series }

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
export class IntentRecognizerSet extends IntentRecognizer {
    private settings: IntentRecognizerSetSettings;
    private recognizers: IntentRecognizer[] = [];

    /**
     * Creates a new instance of a recognizer set.
     *
     * @param settings (Optional) settings to customize the sets execution strategy.
     */
    constructor(settings?: IntentRecognizerSetSettings) {
        super();
        this.settings = Object.assign(<IntentRecognizerSetSettings>{
            recognizeOrder: RecognizeOrder.parallel,
            stopOnExactMatch: true
        }, settings);
        this.onRecognize((context) => {
            if (this.settings.recognizeOrder === RecognizeOrder.parallel) {
                return this.recognizeInParallel(context);
            } else {
                return this.recognizeInSeries(context);
            }
        });
    }

    /**
     * Adds recognizer(s) to the set. Recognizers will be evaluated in the order they're
     * added to the set.
     *
     * @param recognizers One or more recognizers to add to the set.
     */
    public add(...recognizers: IntentRecognizer[]): this {
        Array.prototype.push.apply(this.recognizers, recognizers);
        return this;
    }

    private recognizeInParallel(context: BotContext): Promise<Intent[]> {
        // Call recognize on all children
        const promises: Promise<Intent[]>[] = [];
        this.recognizers.forEach((r) => promises.push(r.recognize(context)));

        // Wait for all of the promises to resolve
        return Promise.all(promises).then((results) => {
            // Merge intents
            let intents: Intent[] = [];
            results.forEach((r) => intents = intents.concat(r));
            return intents;
        });
    }

    private recognizeInSeries(context: BotContext): Promise<Intent[]> {
        return new Promise<Intent[]>((resolve, reject) => {
            let intents: Intent[] = [];
            const that = this;
            function next(i: number) {
                if (i < that.recognizers.length) {
                    that.recognizers[i].recognize(context)
                        .then((r) => {
                            intents = intents.concat(r);
                            if (that.settings.stopOnExactMatch && that.hasExactMatch(r)) {
                                resolve(intents);
                            } else {
                                next(i + 1);
                            }
                        })
                        .catch((err) => reject(err))
                } else {
                    resolve(intents);
                }
            }
            next(0);
        });
    }

    private hasExactMatch(intents: Intent[]): boolean {
        intents.forEach((intent) => {
            if (intent.score >= 1.0) {
                return true;
            }
        });
        return false;
    }
}