/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, RecognizerResult } from 'botbuilder';
import { Converter, ConverterFactory, DialogContext, Recognizer, RecognizerConfiguration } from 'botbuilder-dialogs';
import { LanguagePolicy, LanguagePolicyConverter } from '../languagePolicy';
import { MultiLanguageRecognizerConverter } from '../converters';
import { languagePolicyKey } from '../languageGeneratorExtensions';
import { AdaptiveRecognizer } from './adaptiveRecognizer';

export interface MultiLanguageRecognizerConfiguration extends RecognizerConfiguration {
    languagePolicy?: Record<string, string[]> | LanguagePolicy;
    recognizers?: Record<string, string> | Record<string, Recognizer>;
}

export class MultiLanguageRecognizer extends AdaptiveRecognizer implements MultiLanguageRecognizerConfiguration {
    public static $kind = 'Microsoft.MultiLanguageRecognizer';

    public languagePolicy: LanguagePolicy;

    public recognizers: { [locale: string]: Recognizer };

    public getConverter(property: keyof MultiLanguageRecognizerConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'languagePolicy':
                return new LanguagePolicyConverter();
            case 'recognizers':
                return MultiLanguageRecognizerConverter;
            default:
                return super.getConverter(property);
        }
    }

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

        const locale = (activity.locale ?? '').toLowerCase();
        const policy: string[] = [];
        if (languagepolicy.has(locale)) {
            policy.push(...languagepolicy.get(locale));
        }

        if (locale !== '' && languagepolicy.has('')) {
            // we now explictly add defaultPolicy instead of coding that into target's policy
            policy.push(...languagepolicy.get(''));
        }

        const lowercaseRecognizerKeyLookup = Object.keys(this.recognizers).reduce((acc, key) => {
            acc[key.toLowerCase()] = key;
            return acc;
        }, {});

        for (const option of policy) {
            const recognizerKey = lowercaseRecognizerKeyLookup[option.toLowerCase()];
            if (recognizerKey !== undefined) {
                const recognizer = this.recognizers[recognizerKey];
                const result = await recognizer.recognize(
                    dialogContext,
                    activity,
                    telemetryProperties,
                    telemetryMetrics
                );
                this.trackRecognizerResult(
                    dialogContext,
                    'MultiLanguageRecognizerResult',
                    this.fillRecognizerResultTelemetryProperties(result, telemetryProperties, dialogContext),
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
            this.fillRecognizerResultTelemetryProperties(recognizerResult, telemetryProperties, dialogContext),
            telemetryMetrics
        );

        return recognizerResult;
    }
}
