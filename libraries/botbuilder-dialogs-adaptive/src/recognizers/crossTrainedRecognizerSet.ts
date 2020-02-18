/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { RecognizerResult, Activity, getTopScoringIntent } from 'botbuilder-core';
import { Configurable, DialogContext } from 'botbuilder-dialogs';
import { Recognizer } from './recognizer';

export interface CrossTrainedRecognizerSetConfiguration {
    id?: string;
    recognizers?: Recognizer[];
}

const deferPrefix = 'DeferToRecognizer_';

export class CrossTrainedRecognizerSet extends Configurable implements Recognizer {

    public static declarativeType = 'Microsoft.CrossTrainedRecognizerSet';

    public id: string;

    public recognizers: Recognizer[] = [];

    public configure(config: CrossTrainedRecognizerSetConfiguration): this {
        return super.configure(config);
    }

    public async recognize(dialogContext: DialogContext): Promise<RecognizerResult>;
    public async recognize(dialogContext: DialogContext, textOrActivity: Activity): Promise<RecognizerResult>;
    public async recognize(dialogContext: DialogContext, textOrActivity?: string | Activity, locale?: string): Promise<RecognizerResult> {
        for (let i = 0; i < this.recognizers.length; i++) {
            if (!this.recognizers[i].id) {
                throw new Error('This recognizer requires that each recognizer in the set have an id.');
            }
        }

        let promises: Promise<RecognizerResult>[] = [];
        if (!textOrActivity) {
            promises = this.recognizers.map((recognizer: Recognizer): Promise<RecognizerResult> => {
                return recognizer.recognize(dialogContext);
            });
        } else if (typeof (textOrActivity) == 'object') {
            const activity: Activity = textOrActivity;
            promises = this.recognizers.map((recognizer: Recognizer): Promise<RecognizerResult> => {
                return recognizer.recognize(dialogContext, activity);
            });
        } else if (typeof (textOrActivity) == 'string') {
            const text = textOrActivity;
            promises = this.recognizers.map((recognizer: Recognizer): Promise<RecognizerResult> => {
                return recognizer.recognize(dialogContext, text, locale);
            });
        }
        const results = await Promise.all(promises);

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
            const intent: string = intents[recognizer.id];
            if (!intent.startsWith(deferPrefix)) {
                if (!consensusRecognizedId) {
                    consensusRecognizedId = recognizer.id;
                } else {
                    if (intent == 'None') {
                        continue;
                    } else if (intents[consensusRecognizedId] == 'None') {
                        consensusRecognizedId = recognizer.id;
                    } else {
                        return this.createChooseIntentResult(text, recognizerResults);
                    }
                }
            } else {
                const redirectId = intent.substr(deferPrefix.length);
                const redirectIntent = intents[redirectId];
                if (redirectIntent.startsWith(deferPrefix)) {
                    return this.createChooseIntentResult(text, recognizerResults);
                }
            }
        }

        return recognizerResults[consensusRecognizedId];
    }

    private createChooseIntentResult(text: string, recognizerResults: { [name: string]: RecognizerResult }): RecognizerResult {
        const chooseIntentResult = { score: 0.5 };
        for (const key in recognizerResults) {
            const result = recognizerResults[key];
            const { intent } = getTopScoringIntent(result);
            chooseIntentResult[intent] = result;
        }
        const intents = {};
        intents['chooseintent'] = chooseIntentResult;

        const recognizerResult: RecognizerResult = { text, intents };
        return recognizerResult;
    }
}