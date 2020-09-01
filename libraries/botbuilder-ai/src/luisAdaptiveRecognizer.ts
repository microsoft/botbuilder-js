/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { StringExpression, ArrayExpression, BoolExpression } from 'adaptive-expressions';
import { DialogContext, Recognizer } from 'botbuilder-dialogs';
import { Activity, RecognizerResult } from 'botbuilder-core';
import { LuisPredictionOptions, LuisApplication, LuisRecognizer, LuisRecognizerOptionsV3, LuisTelemetryConstants } from '.';

export class LuisAdaptiveRecognizer extends Recognizer {
    /**
     * LUIS application ID.
     */
    public applicationId: StringExpression;

    /**
     * The flag to indicate in personal information should be logged in telemetry.
     */
    public logPersonalInformation: BoolExpression = new BoolExpression('=settings.telemetry.logPersonalInformation');

    /**
     * LUIS dynamic list.
     */
    public dynamicLists: ArrayExpression<any>;

    /**
     * LUIS endpoint to query.
     * @remarks
     * For example: "https://westus.api.cognitive.microsoft.com"
     */
    public endpoint: StringExpression;

    /**
     * Key used to talk to a LUIS endpoint.
     */
    public endpointKey: StringExpression;

    /**
     * External entity recognizer.
     * @remarks
     * This recognizer is run before calling LUIS and the results are passed to LUIS.
     */
    // public externalEntityRecognizer: Recognizer;

    /**
     * LUIS prediction options.
     */
    public predictionOptions: LuisPredictionOptions;

    public async recognize(dialogContext: DialogContext, activity: Activity, telemetryProperties?: { [key: string]: string }, telemetryMetrics?: { [key: string]: number }) {
        // Validate passed in activity matches turn activity 
        const context = dialogContext.context;
        const utteranceMatches: boolean = !activity || 
            (context.activity.type === activity.type &&  context.activity.text === activity.text);
        
        if (!utteranceMatches) {
            throw new Error(`TurnContext is different than text`);
        }

        // Initialize application info
        const dcState = dialogContext.state;
        const application: LuisApplication = {
            applicationId: this.applicationId.getValue(dcState),
            endpoint: this.endpoint.getValue(dcState),
            endpointKey: this.endpointKey.getValue(dcState)
        };

        // Create and call wrapper
        const wrapper = new LuisRecognizer(application, this.recognizerOptions(dialogContext));

        const result = await wrapper.recognize(context);
        this.trackRecognizerResult(dialogContext, 'LuisResult', this.fillRecognizerResultTelemetryProperties(result, telemetryProperties, dialogContext), telemetryMetrics);
        return result;
    }

    /**
     * Construct V3 recognizer options from the current dialog context.
     * @param dialogContext Current dialog context.
     */
    public recognizerOptions(dialogContext: DialogContext): LuisRecognizerOptionsV3 {
        const options: LuisRecognizerOptionsV3 = Object.assign({}, this.predictionOptions as any);
        if (this.telemetryClient) {
            options.telemetryClient = this.telemetryClient;
        }
        if (this.dynamicLists != null) {
            options.dynamicLists = this.dynamicLists.getValue(dialogContext.state);
        }
        return options;
    }

    /**
     * Fills the event properties for LuisResult event for telemetry.
     * These properties are logged when the recognizer is called.
     * @param recognizerResult Last activity sent from user.
     * @param telemetryProperties Additional properties to be logged to telemetry with the LuisResult event.
     * @param dialogContext Dialog context.
     * @returns A dictionary that is sent as properties to BotTelemetryClient.trackEvent method for the LuisResult event.
     */
    protected  fillRecognizerResultTelemetryProperties(recognizerResult: RecognizerResult, telemetryProperties: { [key: string]: string }, dialogContext: DialogContext): { [key: string]: string } {
        const logPersonalInfo = this.logPersonalInformation.tryGetValue(dialogContext.state);
        const applicationId = this.applicationId.tryGetValue(dialogContext.state);
        
        const topLuisIntent: string = LuisRecognizer.topIntent(recognizerResult);
        const intentScore: number = (recognizerResult.intents[topLuisIntent] && recognizerResult.intents[topLuisIntent].score) || 0;

        // Add the intent score and conversation id properties
        const properties: { [key: string]: string } = {};
        properties[LuisTelemetryConstants.applicationIdProperty] = applicationId.value;
        properties[LuisTelemetryConstants.intentProperty] = topLuisIntent;
        properties[LuisTelemetryConstants.intentScoreProperty] = intentScore.toString();
        properties[LuisTelemetryConstants.fromIdProperty] = dialogContext.context.activity.from.id;

        if (recognizerResult.sentiment) {
            if (recognizerResult.sentiment.label) {
                properties[LuisTelemetryConstants.sentimentLabelProperty] = recognizerResult.sentiment.label;
            }

            if (recognizerResult.sentiment.score) {
                properties[LuisTelemetryConstants.sentimentScoreProperty] = recognizerResult.sentiment.score.toString();
            }
        }

        // Log entity names
        if (recognizerResult.entities) {
            properties[LuisTelemetryConstants.entitiesProperty] = JSON.stringify(recognizerResult.entities);
        }

        // Use the logPersonalInfo flag to toggle logging PII data, text is a common example
        if (logPersonalInfo.value && dialogContext.context.activity.text) {
            properties[LuisTelemetryConstants.questionProperty] = dialogContext.context.activity.text;
        }

        // Additional Properties can override "stock" properties.
        if (telemetryProperties) {
            return Object.assign({}, properties, telemetryProperties);
        }

        return properties;
    }
}