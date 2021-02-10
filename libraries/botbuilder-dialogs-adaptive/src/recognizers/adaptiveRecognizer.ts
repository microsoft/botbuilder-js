/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { BoolExpression } from "adaptive-expressions";
import { RecognizerResult } from "botbuilder-core";
import { DialogContext, Recognizer } from "botbuilder-dialogs";

// TODO - look into JS Recognizer pattern 
// (differs from C# in that it uses <name-of-recognizer>Configuration interfaces)
// I think we might consider AdaptiveRecognizerConfiguration interface
// with optional BoolExpression logPersonalInformation

export abstract class AdaptiveRecognizer extends Recognizer {
    /**
     * (Optional) Flag that designates whether personally identifiable information (PII) should log to telemetry.
     */
    public logPersonalInformation: BoolExpression;

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

        return {"test": "remove me" };
    }
}
