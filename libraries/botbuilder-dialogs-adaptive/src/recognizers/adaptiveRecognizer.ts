/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BoolExpression } from "adaptive-expressions";
import { getTopScoringIntent, RecognizerResult } from "botbuilder-core";
import { DialogContext, Recognizer } from "botbuilder-dialogs";

// TODO
// (differs from C# in that it uses <name-of-recognizer>Configuration interfaces)
// AdaptiveRecognizerConfiguration interface
// with optional BoolExpression logPersonalInformation

export abstract class AdaptiveRecognizer extends Recognizer {
    /**
     * (Optional) Flag that designates whether personally identifiable information (PII) should log to telemetry.
     */
    public logPersonalInformation = new BoolExpression('=settings.telemetry.logPersonalInformation');

    /**
     * Uses the RecognizerResult to create a list of propeties to be included when tracking the result in telemetry.
     * @param recognizerResult Recognizer Result.
     * @param telemetryProperties A list of properties to append or override the properties created using the RecognizerResult.
     * @param dialogContext Dialog Context.
     * @returns A dictionary that can be included when calling the TrackEvent method on the TelemetryClient.
     */
    protected fillRecognizerResultTelemetryProperties(
        recognizerResult: RecognizerResult,
        telemetryProperties: { [key: string]: string },
        dialogContext?: DialogContext
    ): { [key: string]: string } {
        if (dialogContext == null)
        {
            throw new Error('DialogContext needed for state in AdaptiveRecognizer.fillRecognizerResultTelemetryProperties method.');
        }
        const { intent, score } = getTopScoringIntent(recognizerResult);

        const properties: { [key: string]: string } = {
            TopIntent: Object.entries(recognizerResult.intents).length > 0 ? intent : undefined,
            TopIntentScore: Object.entries(recognizerResult.intents).length > 0 ? score.toString() : undefined,
            Intents:
                Object.entries(recognizerResult.intents).length > 0
                    ? JSON.stringify(recognizerResult.intents)
                    : undefined,
            Entities: recognizerResult.entities ? JSON.stringify(recognizerResult.entities) : undefined,
            AdditionalProperties: this.stringifyAdditionalPropertiesOfRecognizerResult(recognizerResult),
        };

        const logPersonalInformation =
            this.logPersonalInformation instanceof BoolExpression
                ? this.logPersonalInformation.getValue(dialogContext.state)
                : this.logPersonalInformation;

        if (logPersonalInformation)
        {
            properties['Text'] = recognizerResult.text
            properties['AlteredText'] = recognizerResult.alteredText
        }

        // Additional Properties can override "stock" properties.
        if (telemetryProperties) {
            return Object.assign({}, properties, telemetryProperties);
        }
        return properties;
    }
}
