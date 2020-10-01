/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { RecognizerResult, Activity } from 'botbuilder-core';
import { DialogContext } from 'botbuilder-dialogs';
import { Recognizer } from './recognizer';
import { LanguagePolicy } from '../languagePolicy';

/**
 * Defines map of languages -> recognizer.
 */
export class MultiLanguageRecognizer extends Recognizer {

    public languagePolicy: LanguagePolicy = new LanguagePolicy();

    public recognizers: { [locale: string]: Recognizer };

    /**
     * Runs current `DialogContext.context.activity` through a recognizer and returns a `RecognizerResult`.
     * @param dialogContext The `DialogContext` for the current turn of conversation.
     * @param activity The `Activity` to recognize.
     * @param telemetryProperties Optional. Additional properties to be logged to telemetry with the LuisResult event.
     * @param telemetryMetrics Optional. Additional metrics to be logged to telemetry with the LuisResult event.
     * @returns Recognized `RecognizerResult` Promise.
     */
    public async recognize(dialogContext: DialogContext, activity: Activity, telemetryProperties?: { [key: string]: string }, telemetryMetrics?: { [key: string]: number }): Promise<RecognizerResult> {
        const locale = activity.locale || '';
        let policy: string[] = [];
        if (this.languagePolicy.has(locale)) {
            this.languagePolicy.get(locale).forEach((u: string): number => policy.push(u));
        }

        if (locale !== '' && this.languagePolicy.has('')) {
            // we now explictly add defaultPolicy instead of coding that into target's policy
            this.languagePolicy.get('').forEach((u: string): number => policy.push(u));
        }

        for (let i = 0; i < policy.length; i++) {
            const option = policy[i];
            if (this.recognizers.hasOwnProperty(option)) {
                const recognizer = this.recognizers[option];
                const result = await recognizer.recognize(dialogContext, activity, telemetryProperties, telemetryMetrics);
                this.trackRecognizerResult(dialogContext, 'MultiLanguagesRecognizerResult', this.fillRecognizerResultTelemetryProperties(result, telemetryProperties), telemetryMetrics);
                return result;

            }
        }

        const recognizerResult: RecognizerResult = {
            text: activity.text || '',
            intents: {},
            entities: {}
        };
        this.trackRecognizerResult(dialogContext, 'MultiLanguagesRecognizerResult', this.fillRecognizerResultTelemetryProperties(recognizerResult, telemetryProperties), telemetryMetrics);

        return recognizerResult;
    }
}
