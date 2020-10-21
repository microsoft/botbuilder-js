/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity, RecognizerResult } from 'botbuilder-core';
import { Converter, ConverterFactory, DialogContext } from 'botbuilder-dialogs';
import { Recognizer, RecognizerConfiguration } from './recognizer';
import { LanguagePolicy, LanguagePolicyConverter } from '../languagePolicy';
import { MultiLanguageRecognizerConverter } from '../converters';
import { languagePolicyKey } from '../languageGeneratorExtensions';

export interface MultiLanguageRecognizerConfiguration extends RecognizerConfiguration {
    languagePolicy?: Record<string, string[]> | LanguagePolicy;
    recognizers?: Record<string, string> | Record<string, Recognizer>;
}

/**
 * Defines map of languages -> recognizer.
 */
export class MultiLanguageRecognizer extends Recognizer implements MultiLanguageRecognizerConfiguration {
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

    /**
     * Runs current `DialogContext.context.activity` through a recognizer and returns a [RecognizerResult](xref:botbuilder-core.RecognizerResult).
     * @param dialogContext The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param activity The [Activity](xref:botframework-schema.Activity) to recognize.
     * @param telemetryProperties Optional. Additional properties to be logged to telemetry with the LuisResult event.
     * @param telemetryMetrics Optional. Additional metrics to be logged to telemetry with the LuisResult event.
     * @returns Recognized [RecognizerResult](xref:botbuilder-core.RecognizerResult) Promise.
     */
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
