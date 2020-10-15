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
import { languagePolicyKey } from '../languageGeneratorExtensions';

export class MultiLanguageRecognizer extends Recognizer {
    public languagePolicy: LanguagePolicy;

    public recognizers: { [locale: string]: Recognizer };

    public async recognize(
        dialogContext: DialogContext,
        activity: Activity,
        telemetryProperties?: { [key: string]: string },
        telemetryMetrics?: { [key: string]: number }
    ): Promise<RecognizerResult> {
        let languagepolicy: LanguagePolicy = this.languagePolicy;
        if (!languagepolicy) {
            languagepolicy = dialogContext.services.get(languagePolicyKey);
            if (!languagepolicy) {
                languagepolicy = new LanguagePolicy();
            }
        }

        const locale = activity.locale || '';
        const policy: string[] = [];
        if (languagepolicy.has(locale)) {
            languagepolicy.get(locale).forEach((u: string): number => policy.push(u));
        }

        if (locale !== '' && languagepolicy.has('')) {
            // we now explictly add defaultPolicy instead of coding that into target's policy
            languagepolicy.get('').forEach((u: string): number => policy.push(u));
        }

        for (let i = 0; i < policy.length; i++) {
            const option = policy[i];
            if (this.recognizers.hasOwnProperty(option)) {
                const recognizer = this.recognizers[option];
                const result = await recognizer.recognize(
                    dialogContext,
                    activity,
                    telemetryProperties,
                    telemetryMetrics
                );
                this.trackRecognizerResult(
                    dialogContext,
                    'MultiLanguagesRecognizerResult',
                    this.fillRecognizerResultTelemetryProperties(result, telemetryProperties),
                    telemetryMetrics
                );
                return result;
            }
        }

        const recognizerResult: RecognizerResult = {
            text: activity.text || '',
            intents: {},
            entities: {},
        };
        this.trackRecognizerResult(
            dialogContext,
            'MultiLanguagesRecognizerResult',
            this.fillRecognizerResultTelemetryProperties(recognizerResult, telemetryProperties),
            telemetryMetrics
        );

        return recognizerResult;
    }
}
