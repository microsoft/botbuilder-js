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
import { TelemetryLoggerConstants } from '../telemetryLoggerConstants';

export interface MultiLanguageRecognizerConfiguration extends RecognizerConfiguration {
    languagePolicy?: Record<string, string[]> | LanguagePolicy;
    recognizers?: Record<string, string> | Record<string, Recognizer>;
}

/**
 * Defines map of languages -> recognizer.
 */
export class MultiLanguageRecognizer extends AdaptiveRecognizer implements MultiLanguageRecognizerConfiguration {
    static $kind = 'Microsoft.MultiLanguageRecognizer';

    languagePolicy: LanguagePolicy;

    recognizers: { [locale: string]: Recognizer };

    /**
     * @param property The key of the conditional selector configuration.
     * @returns The converter for the selector configuration.
     */
    getConverter(property: keyof MultiLanguageRecognizerConfiguration): Converter | ConverterFactory {
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
     * Runs current DialogContext.TurnContext.Activity through a recognizer and returns a [RecognizerResult](xref:botbuilder-core.RecognizerResult).
     *
     * @param dialogContext The [DialogContext](xref:botbuilder-dialogs.DialogContext) for the current turn of conversation.
     * @param activity [Activity](xref:botframework-schema.Activity) to recognize.
     * @param telemetryProperties Optional, additional properties to be logged to telemetry with the LuisResult event.
     * @param telemetryMetrics Optional, additional metrics to be logged to telemetry with the LuisResult event.
     * @returns {Promise<RecognizerResult>} Analysis of utterance.
     */
    async recognize(
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
                    TelemetryLoggerConstants.MultiLanguageRecognizerResultEvent,
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
            TelemetryLoggerConstants.MultiLanguageRecognizerResultEvent,
            this.fillRecognizerResultTelemetryProperties(recognizerResult, telemetryProperties, dialogContext),
            telemetryMetrics
        );

        return recognizerResult;
    }
}
