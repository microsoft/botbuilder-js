"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Middleware that's the base class for all intent recognizers.
 *
 * __Extends BotContext:__
 * * context.topIntent - The top recognized `Intent` for the users utterance.
 */
class Recognizer {
    constructor() {
        this.enabledChain = [];
        this.recognizeChain = [];
        this.filterChain = [];
    }
    receiveActivity(context, next) {
        return this.recognize(context)
            .then((intents) => Recognizer.findTopIntent(intents))
            .then((intent) => {
            if (intent && intent.score > 0.0) {
                context.topIntent = intent;
            }
            return next();
        });
    }
    /**
     * Recognizes intents for the current context. The return value is 0 or more recognized intents.
     *
     * @param context Context for the current turn of the conversation.
     */
    recognize(context) {
        return new Promise((resolve, reject) => {
            this.runEnabled(context)
                .then((enabled) => {
                if (enabled) {
                    this.runRecognize(context)
                        .then((intents) => this.runFilter(context, intents || []))
                        .then((intents) => resolve(intents))
                        .catch((err) => reject(err));
                }
                else {
                    resolve([]);
                }
            })
                .catch((err) => reject(err));
        });
    }
    /**
     * Adds a handler that lets you conditionally determine if a recognizer should run. Multiple
     * handlers can be registered and they will be called in the reverse order they are added
     * so the last handler added will be the first called.
     *
     * @param handler Function that will be called anytime the recognizer is run. If the handler
     * returns true the recognizer will be run. Returning false disables the recognizer.
     */
    onEnabled(handler) {
        this.enabledChain.unshift(handler);
        return this;
    }
    /**
     * Adds a handler that will be called to recognize the users intent. Multiple handlers can
     * be registered and they will be called in the reverse order they are added so the last
     * handler added will be the first called.
     *
     * @param handler Function that will be called to recognize a users intent.
     */
    onRecognize(handler) {
        this.recognizeChain.unshift(handler);
        return this;
    }
    /**
     * Adds a handler that will be called post recognition to filter the output of the recognizer.
     * The filter receives all of the intents that were recognized and can return a subset, or
     * additional, or even all new intents as its response. This filtering adds a convenient second
     * layer of processing to intent recognition. Multiple handlers can be registered and they will
     * be called in the order they are added.
     *
     * @param handler Function that will be called to filter the output intents. If an array is returned
     * that will become the new set of output intents passed on to the next filter. The final filter in
     * the chain will reduce the output set of intents to a single top scoring intent.
     */
    onFilter(handler) {
        this.filterChain.push(handler);
        return this;
    }
    runEnabled(context) {
        return new Promise((resolve, reject) => {
            const chain = this.enabledChain.slice();
            function next(i) {
                if (i < chain.length) {
                    try {
                        Promise.resolve(chain[i](context)).then((enabled) => {
                            if (typeof enabled === 'boolean' && enabled === false) {
                                resolve(false); // Short-circuit chain
                            }
                            else {
                                next(i + 1);
                            }
                        }).catch((err) => reject(err));
                    }
                    catch (err) {
                        reject(err);
                    }
                }
                else {
                    resolve(true);
                }
            }
            next(0);
        });
    }
    runRecognize(context) {
        return new Promise((resolve, reject) => {
            let recognizerResults = [];
            const chain = this.recognizeChain.slice();
            function next(i) {
                if (i < chain.length) {
                    try {
                        Promise.resolve(chain[i](context)).then((result) => {
                            if (Array.isArray(result)) {
                                recognizerResults = recognizerResults.concat(result);
                            }
                            next(i + 1);
                        }).catch((err) => reject(err));
                    }
                    catch (err) {
                        reject(err);
                    }
                }
                else {
                    resolve(recognizerResults);
                }
            }
            next(0);
        });
    }
    runFilter(context, results) {
        return new Promise((resolve, reject) => {
            let filtered = results;
            const chain = this.filterChain.slice();
            function next(i) {
                if (i < chain.length) {
                    try {
                        Promise.resolve(chain[i](context, filtered)).then((result) => {
                            if (Array.isArray(result)) {
                                filtered = result;
                            }
                            next(i + 1);
                        }).catch((err) => reject(err));
                    }
                    catch (err) {
                        reject(err);
                    }
                }
                else {
                    resolve(filtered);
                }
            }
            next(0);
        });
    }
    /**
     * Finds the top scoring intent given a set of intents.
     *
     * @param intents Array of intents to filter.
     */
    static findTopIntent(recognizerResults) {
        return new Promise((resolve, reject) => {
            let top = undefined;
            let intents = [].concat.apply([], recognizerResults.map(recognizerResult => recognizerResult.intents));
            Object.keys(intents).forEach(intent => {
                if (!top || recognizerResults[0].intents[intent] > top.score) {
                    top = {
                        name: intent,
                        score: recognizerResults[0].intents[intent]
                    };
                }
            });
            resolve(top);
        });
    }
}
exports.Recognizer = Recognizer;
//# sourceMappingURL=recognizer.js.map