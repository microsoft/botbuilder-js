/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { BotTelemetryClient, NullTelemetryClient, TurnContext } from 'botbuilder-core';

import {
    FeedbackRecords,
    QnAMakerEndpoint,
    QnAMakerMetadata,
    QnAMakerOptions,
    QnAMakerResult,
    QnAMakerResults,
    RankerTypes,
} from './qnamaker-interfaces';
import { ActiveLearningUtils } from './qnamaker-utils';
import { LanguageServiceUtils } from './qnamaker-utils/languageServiceUtils';
import { QnATelemetryConstants } from './qnaTelemetryConstants';

/**
 * Turn state key for QnAMakerClient.
 */
export const CQAClientKey = Symbol('QnAMakerClient');

/**
 * Client to access a Custom Question Answering knowledge base.
 */
export interface QnAMakerClient {
    /**
     * Generates an answer from the project.
     *
     * @param {TurnContext} turnContext The Turn Context that contains the user question to be queried against your knowledge base.
     * @param {QnAMakerOptions} options The options for the Custom Question Answering Knowledge Base. If null, constructor option is used for this instance.
     * @param {Record<string, string>} telemetryProperties Additional properties to be logged to telemetry with the QnaMessage event.
     * @param {Record<string, number>} telemetryMetrics Additional metrics to be logged to telemetry with the QnaMessage event.
     * @returns {Promise<QnAMakerResult[]>} A list of answers for the user query, sorted in decreasing order of ranking score.
     */
    getAnswers(
        turnContext: TurnContext,
        options?: QnAMakerOptions,
        telemetryProperties?: Record<string, string>,
        telemetryMetrics?: Record<string, number>
    ): Promise<QnAMakerResult[]>;

    /**
     * Generates an answer from the knowledge base.
     *
     * @param {TurnContext} turnContext The Turn Context that contains the user question to be queried against your knowledge base.
     * @param {QnAMakerOptions} options The options for the Custom Question Answering knowledge base. If null, constructor option is used for this instance.
     * @param {Record<string, string>} telemetryProperties Additional properties to be logged to telemetry with the QnaMessage event.
     * @param {Record<string, number>} telemetryMetrics Additional metrics to be logged to telemetry with the QnaMessage event.
     * @returns {Promise<QnAMakerResults>} A list of answers for the user query, sorted in decreasing order of ranking score.
     */
    getAnswersRaw(
        turnContext: TurnContext,
        options?: QnAMakerOptions,
        telemetryProperties?: Record<string, string>,
        telemetryMetrics?: Record<string, number>
    ): Promise<QnAMakerResults>;

    /**
     * Filters the ambiguous question for active learning.
     *
     * @param {QnAMakerResult[]} queryResult User query output.
     * @returns {QnAMakerResult[]} Filtered array of ambiguous question.
     */
    getLowScoreVariation(queryResult: QnAMakerResult[]): QnAMakerResult[];

    /**
     * Send feedback to the knowledge base.
     *
     * @param {FeedbackRecords} feedbackRecords A list of Feedback Records for Active Learning.
     */
    callTrain(feedbackRecords: FeedbackRecords): Promise<void>;
}

/**
 * Interface for adding telemetry logging capabilities to QnAMaker.
 */
export interface QnAMakerTelemetryClient {
    /**
     * Gets a value indicating whether determines whether to log personal information that came from the user.
     */
    readonly logPersonalInformation: boolean;

    /**
     * Gets the currently configured botTelemetryClient that logs the events.
     */
    readonly telemetryClient: BotTelemetryClient;

    /**
     * Calls the QnA Maker service to generate answer(s) for a question.
     *
     * @summary
     * Returns an array of answers sorted by score with the top scoring answer returned first.
     *
     * In addition to returning the results from QnA Maker, [getAnswers()](#getAnswers) will also
     * emit a trace activity that contains the QnA Maker results.
     *
     * @param {TurnContext} context The Turn Context that contains the user question to be queried against your knowledge base.
     * @param {QnAMakerOptions} options (Optional) The options for the QnA Maker knowledge base. If null, constructor option is used for this instance.
     * @param {object} telemetryProperties Additional properties to be logged to telemetry with the QnaMessage event.
     * @param {object} telemetryMetrics Additional metrics to be logged to telemetry with the QnaMessage event.
     * @returns {Promise<QnAMakerResult[]>} A promise resolving to the QnAMaker result
     */
    getAnswers(
        context: TurnContext,
        options?: QnAMakerOptions,
        telemetryProperties?: { [key: string]: string },
        telemetryMetrics?: { [key: string]: number }
    ): Promise<QnAMakerResult[]>;
}

/**
 * Query a Custom Question Answering knowledge base for answers and provide feedbacks.
 *
 * @summary
 * This class is used to make queries to a single QnA Maker knowledge base and return the result.
 *
 * Use this to process incoming messages with the [getAnswers()](#getAnswers) method.
 */
export class CustomQuestionAnswering implements QnAMakerClient, QnAMakerTelemetryClient {
    private readonly _logPersonalInformation: boolean;
    private readonly _telemetryClient: BotTelemetryClient;

    private readonly _options: QnAMakerOptions;
    private readonly languageServiceUtils: LanguageServiceUtils;

    /**
     * Creates a new CustomQuestionAnswering instance.
     *
     * @param {QnAMakerEndpoint} endpoint The endpoint of the knowledge base to query.
     * @param {QnAMakerOptions} options (Optional) additional settings used to configure the instance.
     * @param {BotTelemetryClient} telemetryClient The BotTelemetryClient used for logging telemetry events.
     * @param {boolean} logPersonalInformation Set to true to include personally indentifiable information in telemetry events.
     */
    constructor(
        private readonly endpoint: QnAMakerEndpoint,
        options: QnAMakerOptions = {},
        telemetryClient?: BotTelemetryClient,
        logPersonalInformation?: boolean
    ) {
        if (!endpoint) {
            throw new TypeError('QnAMaker requires valid QnAMakerEndpoint.');
        }

        const {
            scoreThreshold = 0.3,
            top = 1,
            strictFilters = [] as QnAMakerMetadata[],
            metadataBoost = [] as QnAMakerMetadata[],
            filters = undefined,
            timeout = 100000,
            rankerType = RankerTypes.default,
            enablePreciseAnswer = true,
            includeUnstructuredSources = true,
        } = options;

        this._options = {
            scoreThreshold,
            top,
            strictFilters,
            metadataBoost,
            filters,
            timeout,
            rankerType,
            enablePreciseAnswer,
            includeUnstructuredSources,
        } as QnAMakerOptions;

        this.languageServiceUtils = new LanguageServiceUtils(this._options, this.endpoint);

        this._telemetryClient = telemetryClient || new NullTelemetryClient();
        this._logPersonalInformation = logPersonalInformation || false;
    }

    /**
     * Gets a value indicating whether determines whether to log personal information that came from the user.
     *
     * @returns True to determine whether to log personal information that came from the user; otherwise, false.
     */
    get logPersonalInformation(): boolean {
        return this._logPersonalInformation;
    }

    /**
     * Gets the currently configured BotTelemetryClient that logs the events.
     *
     * @returns Currently configured BotTelemetryClient that logs the events.
     */
    get telemetryClient(): BotTelemetryClient {
        return this._telemetryClient;
    }

    /**
     * Calls the Language service to generate answer(s) for a question.
     *
     * @summary
     * Returns an array of answers sorted by score with the top scoring answer returned first.
     *
     * In addition to returning the results from Language service, [getAnswers()](#getAnswers) will also
     * emit a trace activity that contains the query results.
     *
     * @param {TurnContext} context The Turn Context that contains the user question to be queried against your knowledge base.
     * @param {QnAMakerOptions} options (Optional) The options for the Custom Question Answering knowledge base. If null, constructor option is used for this instance.
     * @param {object} telemetryProperties Additional properties to be logged to telemetry with the QnaMessage event.
     * @param {object} telemetryMetrics Additional metrics to be logged to telemetry with the QnaMessage event.
     * @returns {Promise<QnAMakerResult>} A promise resolving to the QnAMaker result
     */
    async getAnswers(
        context: TurnContext,
        options?: QnAMakerOptions,
        telemetryProperties?: { [key: string]: string },
        telemetryMetrics?: { [key: string]: number }
    ): Promise<QnAMakerResult[]> {
        if (!context) {
            throw new TypeError('QnAMaker.getAnswers() requires a TurnContext.');
        }

        const response = await this.getAnswersRaw(context, options, telemetryProperties, telemetryMetrics);

        if (!response) {
            return [];
        }

        return response.answers;
    }

    /**
     * Generates an answer from the knowledge base.
     *
     * @param {TurnContext} context The [TurnContext](xref:botbuilder-core.TurnContext) that contains the user question to be queried against your knowledge base.
     * @param {QnAMakerOptions} options Optional. The [QnAMakerOptions](xref:botbuilder-ai.QnAMakerOptions) for the Custom Question Answering knowledge base. If null, constructor option is used for this instance.
     * @param {object} telemetryProperties Optional. Additional properties to be logged to telemetry with the QnaMessage event.
     * @param {object} telemetryMetrics Optional. Additional metrics to be logged to telemetry with the QnaMessage event.
     * @returns {Promise<QnAMakerResults>} A list of answers for the user query, sorted in decreasing order of ranking score.
     */
    async getAnswersRaw(
        context: TurnContext,
        options: QnAMakerOptions,
        telemetryProperties: { [key: string]: string },
        telemetryMetrics: { [key: string]: number }
    ): Promise<QnAMakerResults> {
        if (!context) {
            throw new TypeError('CustomQuestionAnswering.getAnswersRaw() requires a TurnContext.');
        }

        const response = await this.getKnowledgebaseAnswersRaw(context, options, telemetryProperties, telemetryMetrics);
        return response;
    }

    /**
     * Queries for answers from the Language Service project's knowledge base.
     *
     * @param {TurnContext} context The [TurnContext](xref:botbuilder-core.TurnContext) that contains the user question to be queried against your knowledge base.
     * @param {QnAMakerOptions} options Optional. The [QnAMakerOptions](xref:botbuilder-ai.QnAMakerOptions) for the Language Service project's knowledge base. If null, constructor option is used for this instance.
     * @param {object} telemetryProperties Optional. Additional properties to be logged to telemetry with the QnaMessage event.
     * @param {object} telemetryMetrics Optional. Additional metrics to be logged to telemetry with the QnaMessage event.
     * @returns {Promise<QnAMakerResults>} A list of answers for the user query, sorted in decreasing order of ranking score.
     */
    async getKnowledgebaseAnswersRaw(
        context: TurnContext,
        options: QnAMakerOptions,
        telemetryProperties: { [key: string]: string },
        telemetryMetrics: { [key: string]: number }
    ): Promise<QnAMakerResults> {
        const question: string = this.getTrimmedMessageText(context);
        const queryOptions: QnAMakerOptions = { ...this._options, ...options } as QnAMakerOptions;

        let result: QnAMakerResults;

        if (question.length > 0) {
            result = await this.languageServiceUtils.queryKnowledgebaseRaw(question, queryOptions);
        } else {
            throw new RangeError('Question cannot be null or empty text');
        }
        if (!result) {
            return result;
        }

        await Promise.all([
            // Log telemetry
            this.onQnaResults(result.answers, context, telemetryProperties, telemetryMetrics),
            this.languageServiceUtils.emitTraceInfo(context, result.answers, queryOptions),
        ]);

        return result;
    }

    /**
     * Filters the ambiguous question for active learning.
     *
     * @summary Returns a filtered array of ambiguous question.
     *
     * @param {QnAMakerResult[]} queryResult User query output.
     * @returns {QnAMakerResult[]} the filtered results
     */
    getLowScoreVariation(queryResult: QnAMakerResult[]): QnAMakerResult[] {
        return ActiveLearningUtils.getLowScoreVariation(queryResult);
    }

    /**
     * Send feedback to the knowledge base.
     *
     * @param feedbackRecords  FeedbackRecords for Active Learning.
     * @returns {Promise<void>} A promise representing the async operation.
     */
    async callTrain(feedbackRecords: FeedbackRecords): Promise<void> {
        return await this.languageServiceUtils.addFeedback(feedbackRecords);
    }

    /**
     * Invoked prior to a QnaMessage Event being logged.
     *
     * @param {QnAMakerResult[]} qnaResults The QnA Results for the call.
     * @param {TurnContext} turnContext Context object containing information for a single turn of conversation with a user.
     * @param {object} telemetryProperties Additional properties to be logged to telemetry with the QnaMessage event.
     * @param {object} telemetryMetrics Additional metrics to be logged to telemetry with the QnaMessage event.
     * @returns {Promise<void>} A promise representing the async operation
     */
    protected async onQnaResults(
        qnaResults: QnAMakerResult[],
        turnContext: TurnContext,
        telemetryProperties?: { [key: string]: string },
        telemetryMetrics?: { [key: string]: number }
    ): Promise<void> {
        const [properties, metrics] = await this.fillQnAEvent(
            qnaResults,
            turnContext,
            telemetryProperties,
            telemetryMetrics
        );

        this.telemetryClient.trackEvent({
            name: QnATelemetryConstants.qnaMessageEvent,
            properties,
            metrics,
        });
    }

    /**
     * Fills the event properties for QnaMessage event for telemetry.
     * These properties are logged when the recognizer is called.
     *
     * @param {QnAMakerResult[]} qnaResults Last activity sent from user.
     * @param {TurnContext} turnContext Context object containing information for a single turn of conversation with a user.
     * @param {object} telemetryProperties Additional properties to be logged to telemetry with the QnaMessage event.
     * @param {object} telemetryMetrics Additional properties to be logged to telemetry with the QnaMessage event.
     * @returns {Promise<[object, object]>} A dictionary that is sent as properties to BotTelemetryClient.trackEvent method for the QnaMessage event.
     */
    protected async fillQnAEvent(
        qnaResults: QnAMakerResult[],
        turnContext: TurnContext,
        telemetryProperties?: Record<string, string>,
        telemetryMetrics?: Record<string, number>
    ): Promise<[Record<string, string>, Record<string, number>]> {
        const properties: Record<string, string> = {
            [QnATelemetryConstants.knowledgeBaseIdProperty]: this.endpoint.knowledgeBaseId,
        };

        const metrics: Record<string, number> = {};

        const text = turnContext.activity?.text;
        const userName = turnContext.activity?.from?.name;
        // Use the LogPersonalInformation flag to toggle logging PII data, text is a common example
        if (this.logPersonalInformation) {
            if (text) {
                properties[QnATelemetryConstants.questionProperty] = text;
            }
            if (userName) {
                properties[QnATelemetryConstants.usernameProperty] = userName;
            }
        }

        // Fill in Qna Results (found or not)
        const [queryResult] = qnaResults;
        Object.assign(properties, {
            [QnATelemetryConstants.matchedQuestionProperty]:
                JSON.stringify(queryResult?.questions) ?? 'No Qna Question matched',
            [QnATelemetryConstants.questionIdProperty]: queryResult?.id?.toString() ?? 'No Qna Question Id matched',
            [QnATelemetryConstants.answerProperty]: queryResult?.answer ?? 'No Qna Answer matched',
            [QnATelemetryConstants.articleFoundProperty]: JSON.stringify(queryResult != null),
        });

        if (queryResult) {
            metrics[QnATelemetryConstants.scoreMetric] = queryResult.score;
        }

        // Additional Properties can override "stock" properties.
        if (telemetryProperties) {
            Object.assign(properties, telemetryProperties);
        }

        // Additional Metrics can override "stock" metrics.
        if (telemetryMetrics) {
            Object.assign(metrics, telemetryMetrics);
        }

        return [properties, metrics];
    }

    // Gets the message from the Activity in the TurnContext, trimmed of whitespaces.
    private getTrimmedMessageText(context: TurnContext): string {
        return context?.activity?.text?.trim() ?? '';
    }
}
