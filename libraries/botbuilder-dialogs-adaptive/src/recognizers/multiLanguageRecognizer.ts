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
