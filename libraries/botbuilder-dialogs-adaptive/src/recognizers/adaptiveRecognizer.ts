/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BoolExpression } from 'adaptive-expressions';
import omit from 'lodash/omit';
import { getTopScoringIntent, RecognizerResult } from 'botbuilder';
import { DialogContext, Recognizer } from 'botbuilder-dialogs';

export interface AdaptiveRecognizerConfiguration {
    logPersonalInformation?: BoolExpression;
}

/**
 * Base class for adaptive recognizers.
 */
export abstract class AdaptiveRecognizer extends Recognizer implements AdaptiveRecognizerConfiguration {
    /**
     * (Optional) Flag that designates whether personally identifiable information (PII) should log to telemetry.
     */
    logPersonalInformation: BoolExpression = new BoolExpression(
        '=settings.runtimeSettings.telemetry.logPersonalInformation'
    );

    /**
     * Uses the RecognizerResult to create a list of properties to be included when tracking the result in telemetry.
     *
     * @param {RecognizerResult} recognizerResult Recognizer Result.
     * @param {object} telemetryProperties A list of properties to append or override the properties created using the RecognizerResult.
     * @param {DialogContext} dialogContext Dialog Context.
     * @returns {Record<string, string>} A collection of properties that can be included when calling the TrackEvent method on the TelemetryClient.
     */
    protected fillRecognizerResultTelemetryProperties(
        recognizerResult: RecognizerResult,
        telemetryProperties: Record<string, string>,
        dialogContext: DialogContext
    ): Record<string, string> {
        if (!dialogContext) {
            throw new Error(
                'DialogContext needed for state in AdaptiveRecognizer.fillRecognizerResultTelemetryProperties method.'
            );
        }
        const { intent, score } = getTopScoringIntent(recognizerResult);
        const intentsCount = Object.entries(recognizerResult.intents).length;
        const properties: Record<string, string> = {
            TopIntent: intentsCount > 0 ? intent : undefined,
            TopIntentScore: intentsCount > 0 ? score.toString() : undefined,
            Intents: intentsCount > 0 ? JSON.stringify(recognizerResult.intents) : undefined,
            Entities: recognizerResult.entities ? JSON.stringify(recognizerResult.entities) : undefined,
            AdditionalProperties: JSON.stringify(
                omit(recognizerResult, ['text', 'alteredText', 'intents', 'entities'])
            ),
        };

        const logPersonalInformation =
            this.logPersonalInformation instanceof BoolExpression
                ? this.logPersonalInformation.getValue(dialogContext.state)
                : this.logPersonalInformation;

        if (logPersonalInformation) {
            properties['Text'] = recognizerResult.text;
            properties['AlteredText'] = recognizerResult.alteredText;
        }

        // Additional Properties can override "stock" properties.
        if (telemetryProperties) {
            return Object.assign({}, properties, telemetryProperties);
        }
        return properties;
    }
}
