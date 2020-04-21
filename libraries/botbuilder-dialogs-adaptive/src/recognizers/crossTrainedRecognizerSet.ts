/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { RecognizerResult, Activity, getTopScoringIntent } from 'botbuilder-core';
import { DialogContext } from 'botbuilder-dialogs';
import { Recognizer } from './recognizer';

const deferPrefix = 'DeferToRecognizer_';

export class CrossTrainedRecognizerSet implements Recognizer {

    public id: string;

    public recognizers: Recognizer[] = [];

    public async recognize(dialogContext: DialogContext, activity: Activity): Promise<RecognizerResult> {
        for (let i = 0; i < this.recognizers.length; i++) {
            if (!this.recognizers[i].id) {
                throw new Error('This recognizer requires that each recognizer in the set have an id.');
            }
        }

        const results = await Promise.all(this.recognizers.map((recognizer: Recognizer): Promise<RecognizerResult> => {
            return recognizer.recognize(dialogContext, activity);
        }));

        const recognizerResults = {};
        const intents = {};
        let text = '';
        for (let i = 0; i < results.length; i++) {
            const result = results[i];
            const recognizer = this.recognizers[i];
            recognizerResults[recognizer.id] = result;
            const { intent } = getTopScoringIntent(result);
            intents[recognizer.id] = intent;
            text = result.text || '';
        }

        let consensusRecognizedId: string;
        for (let i = 0; i < this.recognizers.length; i++) {
            const recognizer = this.recognizers[i];
            let recognizerId = recognizer.id;
            let intent: string = intents[recognizer.id];
            if (this.isRedirect(intent)) {
                // follow redirect and see where it takes us
                recognizerId = this.getRedirectId(intent);
                intent = intents[recognizerId];
                while (recognizerId != recognizer.id && this.isRedirect(intent)) {
                    recognizerId = this.getRedirectId(intent);
                    intent = intents[recognizerId];
                }

                // if we ended up back at the recognizer.id and we have no consensus then it's a none intent
                if (recognizerId == recognizer.id && !consensusRecognizedId) {
                    const recognizerResult: RecognizerResult = {
                        text: recognizerResults[recognizer.id].text,
                        intents: { 'None': { score: 1.0 } }
                    };
                    return recognizerResult;
                }
            }

            // we have a real intent and it's the first one we found
            if (!consensusRecognizedId) {
                if (intent != 'None') {
                    consensusRecognizedId = recognizerId;
                }
            } else {
                // we have a second recognizer result which is either none or real
                // if one of them is None intent, then go with the other one
                if (intent == 'None') {
                    // then we are fine with the one we have, just ignore this one
                    continue;
                } else if (recognizerId == consensusRecognizedId) {
                    // this is more consensus for this recognizer
                    continue;
                } else {
                    return this.createChooseIntentResult(recognizerResults);
                }
            }
        }

        // we have consensus for consensusRecognizer, return the results of that recognizer as the result
        if (consensusRecognizedId) {
            return recognizerResults[consensusRecognizedId];
        }

        // return none
        const recognizerResult: RecognizerResult = {
            text,
            intents: { 'None': { score: 1.0 } }
        };
        return recognizerResult;
    }

    private createChooseIntentResult(recognizerResults: { [name: string]: RecognizerResult }): RecognizerResult {
        let text: string;
        const candidates: object[] = [];

        for (const key in recognizerResults) {
            const result = recognizerResults[key];
            text = result.text;
            const { intent, score } = getTopScoringIntent(result);
            if (!this.isRedirect(intent) && intent != 'None') {
                candidates.push({
                    id: key,
                    intent,
                    score,
                    result
                });
            }
        }

        if (candidates.length > 0) {
            const recognizerResult: RecognizerResult = {
                text,
                intents: { 'ChooseIntent': { score: 1.0 } },
                candidates
            };
            return recognizerResult;
        }

        const recognizerResult: RecognizerResult = {
            text,
            intents: { 'None': { score: 1.0 } }
        };
        return recognizerResult;
    }

    private isRedirect(intent: string): boolean {
        return intent.startsWith(deferPrefix);
    }

    private getRedirectId(intent: string): string {
        return intent.substr(deferPrefix.length);
    }
}