/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {
    ArrayExpression,
    ArrayExpressionConverter,
    BoolExpression,
    BoolExpressionConverter,
    Expression,
    StringExpression,
    StringExpressionConverter,
} from 'adaptive-expressions';

import { Activity, RecognizerResult } from 'botbuilder-core';
import { Converter, ConverterFactory, DialogContext, Recognizer, RecognizerConfiguration } from 'botbuilder-dialogs';
import { ListElement } from './listElement';
import {
    LuisAdaptivePredictionOptions,
    LuisAdaptivePredictionOptionsConfiguration,
    LuisAdaptivePredictionOptionsConverter,
} from './luisAdaptivePredictionOptions';
import { LuisApplication, LuisRecognizer, LuisRecognizerOptionsV3 } from './luisRecognizer';
import { LuisTelemetryConstants } from './luisTelemetryConstants';

/**
 * Defines an extension for a list entity.
 */
type DynamicList = {
    /**
     * The name of the list to extend.
     */
    entity: string;
    /**
     * The lists to append on the extended list entity.
     */
    list: ListElement[];
};

export interface LuisAdaptiveRecognizerConfiguration extends RecognizerConfiguration {
    applicationId?: string | Expression | StringExpression;
    version?: string | Expression | StringExpression;
    endpoint?: string | Expression | StringExpression;
    endpointKey?: string | Expression | StringExpression;
    externalEntityRecognizer?: string | Recognizer;
    dynamicLists?: unknown[] | string | Expression | ArrayExpression<unknown>;
    predictionOptions?: LuisAdaptivePredictionOptionsConfiguration | LuisAdaptivePredictionOptions;
    logPersonalInformation?: boolean | string | Expression | BoolExpression;
}

/**
 * Class that represents an adaptive LUIS recognizer.
 */
export class LuisAdaptiveRecognizer extends Recognizer implements LuisAdaptiveRecognizerConfiguration {
    static $kind = 'Microsoft.LuisRecognizer';

    /**
     * LUIS application ID.
     */
    applicationId: StringExpression;

    /**
     * LUIS application version.
     */
    version: StringExpression;

    /**
     * LUIS endpoint to query.
     *
     * @summary
     * For example: "https://westus.api.cognitive.microsoft.com"
     */
    endpoint: StringExpression;

    /**
     * Key used to talk to a LUIS endpoint.
     */
    endpointKey: StringExpression;

    /**
     * External entity recognizer.
     *
     * @summary
     * This recognizer is run before calling LUIS and the results are passed to LUIS.
     */
    externalEntityRecognizer: Recognizer;

    /**
     * LUIS dynamic list.
     */
    dynamicLists: ArrayExpression<DynamicList>;

    /**
     * LUIS prediction options.
     */
    predictionOptions: LuisAdaptivePredictionOptions;

    /**
     * The flag to indicate in personal information should be logged in telemetry.
     */
    logPersonalInformation: BoolExpression = new BoolExpression(
        '=settings.runtimeSettings.telemetry.logPersonalInformation'
    );

    /**
     * @param property Properties that extend RecognizerConfiguration.
     * @returns Expression converter.
     */
    getConverter(property: keyof LuisAdaptiveRecognizerConfiguration): Converter | ConverterFactory {
        switch (property) {
            case 'applicationId':
            case 'version':
            case 'endpoint':
            case 'endpointKey':
                return new StringExpressionConverter();
            case 'dynamicLists':
                return new ArrayExpressionConverter();
            case 'predictionOptions':
                return new LuisAdaptivePredictionOptionsConverter();
            case 'logPersonalInformation':
                return new BoolExpressionConverter();
            default:
                return super.getConverter(property);
        }
    }

    /**
     * To recognize intents and entities in a users utterance.
     *
     * @param {DialogContext} dialogContext The [DialogContext](xref:botbuilder-dialogs.DialogContext).
     * @param {Activity} activity The [Activity](xref:botbuilder-core.Activity).
     * @param {object} telemetryProperties Optional. Additional properties to be logged to telemetry with event.
     * @param {object} telemetryMetrics Optional. Additional metrics to be logged to telemetry with event.
     * @returns {Promise<RecognizerResult>} A promise resolving to the recognizer result.
     */
    async recognize(
        dialogContext: DialogContext,
        activity: Activity,
        telemetryProperties?: Record<string, string>,
        telemetryMetrics?: Record<string, number>
    ): Promise<RecognizerResult> {
        // Validate passed in activity matches turn activity
        const context = dialogContext.context;
        const utteranceMatches: boolean =
            !activity || (context.activity.type === activity.type && context.activity.text === activity.text);

        if (!utteranceMatches) {
            throw new Error('TurnContext is different than text');
        }

        // Initialize application info
        const dcState = dialogContext.state;
        const application: LuisApplication = {
            applicationId: this.applicationId.getValue(dcState),
            endpoint: this.endpoint.getValue(dcState),
            endpointKey: this.endpointKey.getValue(dcState),
        };

        // Create and call wrapper
        const recognizer = new LuisRecognizer(application, this.recognizerOptions(dialogContext));

        const result = await recognizer.recognize(dialogContext);
        this.trackRecognizerResult(
            dialogContext,
            'LuisResult',
            this.fillRecognizerResultTelemetryProperties(result, telemetryProperties, dialogContext),
            telemetryMetrics
        );

        return result;
    }

    /**
     * Construct V3 recognizer options from the current dialog context.
     *
     * @param {DialogContext} dialogContext Current dialog context.
     * @returns {LuisRecognizerOptionsV3} luis recognizer options
     */
    recognizerOptions(dialogContext: DialogContext): LuisRecognizerOptionsV3 {
        const options: LuisRecognizerOptionsV3 = {
            apiVersion: 'v3',
            externalEntityRecognizer: this.externalEntityRecognizer,
            telemetryClient: dialogContext.context.turnState.get('telemetryClient'),
            includeAllIntents: false,
            includeInstanceData: false,
            includeAPIResults: false,
            log: true,
            preferExternalEntities: true,
            slot: 'production',
        };

        const dcState = dialogContext.state;

        if (this.predictionOptions) {
            options.datetimeReference = this.predictionOptions.dateTimeReference?.getValue(dcState);
            options.externalEntities = this.predictionOptions.externalEntities?.getValue(dcState);
            options.includeAllIntents = this.predictionOptions.includeAllIntents?.getValue(dcState) ?? false;
            options.includeInstanceData = this.predictionOptions.includeInstanceData?.getValue(dcState) ?? true;
            options.includeAPIResults = this.predictionOptions.includeAPIResults?.getValue(dcState) ?? false;
            options.log = this.predictionOptions.log?.getValue(dcState) ?? true;
            options.preferExternalEntities = this.predictionOptions.preferExternalEntities?.getValue(dcState) ?? true;
            options.slot = this.predictionOptions.slot?.getValue(dcState) === 'staging' ? 'staging' : 'production';
        }

        if (this.version) {
            options.version = this.version.getValue(dcState);
        }

        if (this.dynamicLists) {
            options.dynamicLists = this.dynamicLists.getValue(dcState).map((item) => ({
                listEntityName: item.entity,
                requestLists: item.list,
            }));
        }

        return options;
    }

    /**
     * Fills the event properties for LuisResult event for telemetry.
     * These properties are logged when the recognizer is called.
     *
     * @param {RecognizerResult} recognizerResult Last activity sent from user.
     * @param {object} telemetryProperties Additional properties to be logged to telemetry with the LuisResult event.
     * @param {DialogContext} dialogContext Dialog context.
     * @returns {object} A dictionary that is sent as properties to BotTelemetryClient.trackEvent method for the LuisResult event.
     */
    protected fillRecognizerResultTelemetryProperties(
        recognizerResult: RecognizerResult,
        telemetryProperties: { [key: string]: string },
        dialogContext: DialogContext
    ): { [key: string]: string } {
        const logPersonalInfo = this.logPersonalInformation.tryGetValue(dialogContext.state);
        const applicationId = this.applicationId.tryGetValue(dialogContext.state);

        const [firstIntent, secondIntent] = LuisRecognizer.sortedIntents(recognizerResult);

        // Add the intent score and conversation id properties
        const properties: { [key: string]: string } = {};

        properties[LuisTelemetryConstants.applicationIdProperty] = applicationId.value;

        properties[LuisTelemetryConstants.intentProperty] = firstIntent?.intent ?? '';
        properties[LuisTelemetryConstants.intentScoreProperty] = (firstIntent?.score ?? 0).toString();
        properties[LuisTelemetryConstants.intent2Property] = secondIntent?.intent ?? '';
        properties[LuisTelemetryConstants.intentScore2Property] = (secondIntent?.score ?? 0).toString();

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
