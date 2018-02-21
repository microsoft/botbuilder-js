/**
 * @module botbuilder
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
 */
import { Middleware, Promiseable } from './middleware';
import { RecognizerResult } from './recognizerResult';
import { Intent } from './intentRecognizer';


/**
 * Middleware that's the base class for all intent recognizers.
 * 
 * __Extends BotContext:__
 * * context.topIntent - The top recognized `Intent` for the users utterance.
 */
export class Recognizer implements Middleware {
    private enabledChain: ((context: BotContext) => Promiseable<boolean>)[] = [];
    private recognizeChain: ((context: BotContext) => Promiseable<RecognizerResult[]>)[] = [];
    private filterChain: ((context: BotContext, intents: RecognizerResult[]) => Promise<RecognizerResult|void>|RecognizerResult|void)[] = [];

    public receiveActivity(context: BotContext, next: () => Promise<void>): Promise<void> {
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
    public recognize(context: BotContext): Promise<RecognizerResult[]> {
        return new Promise<RecognizerResult[]>((resolve, reject) => {
            this.runEnabled(context)
                .then((enabled) => {
                    if (enabled) {
                        this.runRecognize(context)
                            .then((intents) => this.runFilter(context, intents || []))
                            .then((intents) => resolve(intents))
                            .catch((err) => reject(err));
                    } else {
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
    public onEnabled(handler: (context: BotContext) => Promiseable<boolean>): this {
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
    public onRecognize(handler: (context: BotContext) => Promiseable<RecognizerResult[]>): this {
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
    public onFilter(handler: (context: BotContext, intents: RecognizerResult[]) => Promiseable<RecognizerResult|void>): this {
        this.filterChain.push(handler);
        return this;
    }

    private runEnabled(context: BotContext): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            const chain = this.enabledChain.slice();
            function next(i: number) {
                if (i < chain.length) {
                    try {
                        Promise.resolve(chain[i](context)).then((enabled) => {
                            if (typeof enabled === 'boolean' && enabled === false) {
                                resolve(false); // Short-circuit chain
                            } else {
                                next(i + 1);
                            }
                        }).catch((err) => reject(err));
                    } catch(err) {
                        reject(err);
                    }
                } else {
                    resolve(true);
                }
            }
            next(0);
        });
    }

    private runRecognize(context: BotContext): Promise<RecognizerResult[]> {
        return new Promise<RecognizerResult[]>((resolve, reject) => {
            let recognizerResults : RecognizerResult[] = [];
            const chain = this.recognizeChain.slice();
            function next(i: number) {
                if (i < chain.length) {
                    try {
                        Promise.resolve(chain[i](context)).then((result) => {
                            if (Array.isArray(result)) {
                                recognizerResults = recognizerResults.concat(result);
                            }
                            next(i + 1);
                        }).catch((err) => reject(err));
                    } catch(err) {
                        reject(err);
                    }
                } else {
                    resolve(recognizerResults);
                }
            }
            next(0);
        });
    }

    private runFilter(context: BotContext, results: RecognizerResult[]): Promise<RecognizerResult[]> {
        return new Promise<RecognizerResult[]>((resolve, reject) => {
            let filtered : RecognizerResult[] = results;
            const chain = this.filterChain.slice();
            function next(i: number) {
                if (i < chain.length) {
                    try {
                        Promise.resolve(chain[i](context, filtered)).then((result) => {
                            if (Array.isArray(result)) {
                                filtered = result;
                            }
                            next(i + 1);
                        }).catch((err) => reject(err));
                    } catch(err) {
                        reject(err);
                    }
                } else {
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
    static findTopIntent(recognizerResults: RecognizerResult[]): Promise<Intent|undefined> {
        return new Promise<Intent|undefined>((resolve, reject) => {
            let top: Intent|undefined = undefined;

            let intents : any = [].concat.apply([],recognizerResults.map(recognizerResult => recognizerResult.intents));
            Object.keys(intents).forEach(intent => {
                if (!top || recognizerResults[0].intents[intent] > top.score) {
                    top = {
                            name: intent,
                            score: recognizerResults[0].intents[intent]
                    } as Intent;
                }
            });
            resolve(top);
        });
    }
}