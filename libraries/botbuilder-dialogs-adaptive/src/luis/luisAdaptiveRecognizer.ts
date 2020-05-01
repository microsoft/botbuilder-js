/**
 * @module botbuilder-dialogs-adaptive
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Recognizer } from '../recognizers';
import { StringExpression, ArrayExpression } from 'adaptive-expressions';
import { LuisPredictionOptions, LuisRecognizerOptionsV3, LuisRecognizer, LuisApplication } from 'botbuilder-ai';
import { Configurable, DialogContext } from 'botbuilder-dialogs';
import { BotTelemetryClient, Activity, ActivityTypes } from 'botbuilder-core';

export class LuisAdaptiveRecognizer extends Configurable implements Recognizer {
    /**
     * Recognizers unique ID.
     */
    public id: string;

    /**
     * LUIS application ID.
     */
    public applicationId: StringExpression;

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


    /**
     * Telemetry client.
     */
    public telemetryClient: BotTelemetryClient;

    public async recognize(dialogContext: DialogContext, activity: Activity) {
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
        }

        // Create and call wrapper
        const wrapper = new LuisRecognizer(application, this.recognizerOptions(dialogContext));
        return await wrapper.recognize(context);
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
}