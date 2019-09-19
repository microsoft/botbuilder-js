/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, TurnContext, BotTelemetryClient, NullTelemetryClient } from 'botbuilder-core';

import { constants } from 'http2';
import { QnATelemetryConstants } from './qnaTelemetryConstants';
import { QnAMakerEndpoint } from './qnamaker-interfaces/qnamakerEndpoint';
import { QnAMakerMetadata } from './qnamaker-interfaces/qnamakerMetadata';
import { QnAMakerOptions } from './qnamaker-interfaces/qnamakerOptions';
import { QnAMakerResult } from './qnamaker-interfaces/qnamakerResult';
import { FeedbackRecords } from './qnamaker-interfaces/feedbackRecords';

import { GenerateAnswerUtils } from './qnamaker-utils/generateAnswerUtils';
import { ActiveLearningUtils } from './qnamaker-utils/activeLearningUtils';
import { TrainUtils } from './qnamaker-utils/trainUtils';
import { QnAMakerResults } from './qnamaker-interfaces/qnamakerResults';

export const QNAMAKER_TRACE_TYPE = 'https://www.qnamaker.ai/schemas/trace';
export const QNAMAKER_TRACE_NAME = 'QnAMaker';
export const QNAMAKER_TRACE_LABEL = 'QnAMaker Trace';

export interface QnAMakerTelemetryClient
{
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
     * @remarks
     * Returns an array of answers sorted by score with the top scoring answer returned first.
     *
     * In addition to returning the results from QnA Maker, [getAnswers()](#getAnswers) will also
     * emit a trace activity that contains the QnA Maker results.
     *
     * @param context The Turn Context that contains the user question to be queried against your knowledge base.
     * @param options (Optional) The options for the QnA Maker knowledge base. If null, constructor option is used for this instance.
     * @param telemetryProperties Additional properties to be logged to telemetry with the QnaMessage event.
     * @param telemetryMetrics Additional metrics to be logged to telemetry with the QnaMessage event.
     */
    getAnswers(context: TurnContext, options?: QnAMakerOptions, telemetryProperties?: {[key: string]:string}, telemetryMetrics?: {[key: string]:number} ): Promise<QnAMakerResult[]>;
}

/**
 * Query a QnA Maker knowledge base for answers and provide feedbacks.
 *
 * @remarks
 * This class is used to make queries to a single QnA Maker knowledge base and return the result.
 *
 * Use this to process incoming messages with the [getAnswers()](#getAnswers) method.
 */
export class QnAMaker implements QnAMakerTelemetryClient {
    private readonly _logPersonalInformation: boolean;
    private readonly _telemetryClient: BotTelemetryClient;

    private readonly _options: QnAMakerOptions;
    private readonly generateAnswerUtils: GenerateAnswerUtils;
    private readonly trainUtils: TrainUtils;

    /**
     * Creates a new QnAMaker instance.
     * @param endpoint The endpoint of the knowledge base to query.
     * @param options (Optional) additional settings used to configure the instance.
     * @param telemetryClient The BotTelemetryClient used for logging telemetry events.
     * @param logPersonalInformation Set to true to include personally indentifiable information in telemetry events.
     */
    constructor(private readonly endpoint: QnAMakerEndpoint, options: QnAMakerOptions = {} as QnAMakerOptions, telemetryClient?: BotTelemetryClient, logPersonalInformation?: boolean) {
        if (!endpoint) {
            throw new TypeError('QnAMaker requires valid QnAMakerEndpoint.');
        }

        const {
            scoreThreshold = 0.3,
            top = 1,
            strictFilters = [] as QnAMakerMetadata[],
            metadataBoost = [] as QnAMakerMetadata[],
            timeout = 100000
        } = options;

        this._options = {
            scoreThreshold,
            top,
            strictFilters,
            metadataBoost,
            timeout
        } as QnAMakerOptions;

        this.generateAnswerUtils = new GenerateAnswerUtils(this._options, this.endpoint);
        this.trainUtils = new TrainUtils(this.endpoint);

        this._telemetryClient = telemetryClient || new NullTelemetryClient();
        this._logPersonalInformation = logPersonalInformation || false;
    }

    /**
     * Gets a value indicating whether determines whether to log personal information that came from the user.
     */
    public get logPersonalInformation(): boolean { return this._logPersonalInformation; }

   /**
     * Gets the currently configured botTelemetryClient that logs the events.
     */
    public get telemetryClient(): BotTelemetryClient { return this._telemetryClient; }

    /**
     * Calls the QnA Maker service to generate answer(s) for a question.
     *
     * @remarks
     * Returns an array of answers sorted by score with the top scoring answer returned first.
     *
     * In addition to returning the results from QnA Maker, [getAnswers()](#getAnswers) will also
     * emit a trace activity that contains the QnA Maker results.
     *
     * @param context The Turn Context that contains the user question to be queried against your knowledge base.
     * @param options (Optional) The options for the QnA Maker knowledge base. If null, constructor option is used for this instance.
     * @param telemetryProperties Additional properties to be logged to telemetry with the QnaMessage event.
     * @param telemetryMetrics Additional metrics to be logged to telemetry with the QnaMessage event.
     */
    public async getAnswers(context: TurnContext, options?: QnAMakerOptions, telemetryProperties?: {[key: string]:string}, telemetryMetrics?: {[key: string]:number} ): Promise<QnAMakerResult[]> {
        if (!context) {
            throw new TypeError('QnAMaker.getAnswers() requires a TurnContext.');
        }

        var response = await this.getAnswersRaw(context, options, telemetryProperties, telemetryMetrics);

        if (!response) {
            return [];
        }

        return response.answers;
    }

    public async getAnswersRaw(context: TurnContext, options?: QnAMakerOptions, telemetryProperties?: {[key: string]:string}, telemetryMetrics?: {[key: string]:number} ): Promise<QnAMakerResults> {
        if (!context) {
            throw new TypeError('QnAMaker.getAnswers() requires a TurnContext.');
        }

        const queryResult: QnAMakerResult[] = [] as QnAMakerResult[];
        const question: string = this.getTrimmedMessageText(context);
        const queryOptions: QnAMakerOptions = { ...this._options, ...options } as QnAMakerOptions;

        this.generateAnswerUtils.validateOptions(queryOptions);

        var result: QnAMakerResults;

        if (question.length > 0) {
            result = await this.generateAnswerUtils.queryQnaServiceRaw(this.endpoint, question, queryOptions);
            
            const sortedQnaAnswers: QnAMakerResult[] = GenerateAnswerUtils.sortAnswersWithinThreshold(result.answers, queryOptions);
            queryResult.push(...sortedQnaAnswers);
        }

        if (!result) {
            return result;
        }

        // Log telemetry
        this.onQnaResults(queryResult, context, telemetryProperties, telemetryMetrics);

        await this.generateAnswerUtils.emitTraceInfo(context, queryResult, queryOptions);

        const qnaResponse: QnAMakerResults = {
            activeLearningEnabled: result.activeLearningEnabled,
            answers: queryResult
        }

        return qnaResponse;
    }

    /**
     * Calls [generateAnswer()](#generateanswer) and sends the resulting answer as a reply to the user.
     * @deprecated Instead, favor using [QnAMaker.getAnswers()](#getAnswers) to generate answers for a question.
     *
     * @remarks
     * Returns a value of `true` if an answer was found and sent. If multiple answers are
     * returned the first one will be delivered.
     * @param context Context for the current turn of conversation with the user.
     */
    public async answer(context: TurnContext): Promise<boolean> {
        if (!context) {
            throw new TypeError('QnAMaker.answer() requires a TurnContext.');
        }

        const { top, scoreThreshold } = this._options;
        const question: string = this.getTrimmedMessageText(context);
        const answers: QnAMakerResult[] = await this.generateAnswer(question, top, scoreThreshold);

        await this.generateAnswerUtils.emitTraceInfo(context, answers, this._options);

        if (answers.length > 0) {
            await context.sendActivity({ text: answers[0].answer, type: 'message' });

            return true;
        }

        return false;
    }

    /**
     * Calls the QnA Maker service to generate answer(s) for a question.
     *
     * @deprecated Instead, favor using [QnAMaker.getAnswers()](#getAnswers) to generate answers for a question.
     *
     * @remarks
     * Returns an array of answers sorted by score with the top scoring answer returned first.
     *
     * @param question The question to answer.
     * @param top (Optional) number of answers to return. Defaults to a value of `1`.
     * @param scoreThreshold (Optional) minimum answer score needed to be considered a match to questions. Defaults to a value of `0.001`.
     */
    public async generateAnswer(question: string|undefined, top?: number, scoreThreshold?: number): Promise<QnAMakerResult[]> {
        const trimmedAnswer: string = question ? question.trim() : '';

        if (trimmedAnswer.length > 0) {
            const result: QnAMakerResults = await this.callService(this.endpoint, question, typeof top === 'number' ? top : 1);
            const minScore: number = typeof scoreThreshold === 'number' ? scoreThreshold : 0.001;

            return result.answers.filter(
                (ans: QnAMakerResult) => ans.score >= minScore)
                .sort((a: QnAMakerResult, b: QnAMakerResult) => b.score - a.score);
        }

        return [] as QnAMakerResult[];
    }

    /**
     * Filters the ambiguous question for active learning.
     *
     * @remarks
     * Returns a filtered array of ambiguous question.
     *
     * @param queryResult User query output.
     */
    public getLowScoreVariation(queryResult: QnAMakerResult[] ) {
        return ActiveLearningUtils.getLowScoreVariation(queryResult);
    }

    /**
     * Send feedback to the knowledge base.
     *
     * @param feedbackRecords Feedback records.
     */
    public async callTrainAsync(feedbackRecords: FeedbackRecords) {
        return await this.trainUtils.callTrainAsync(feedbackRecords);
    }

    /**
     * Called internally to query the QnA Maker service.
     *
     * @remarks
     * This is exposed to enable better unit testing of the service.
     */
    protected async callService(endpoint: QnAMakerEndpoint, question: string, top: number): Promise<QnAMakerResults> {
        return this.generateAnswerUtils.queryQnaServiceRaw(endpoint, question, { top } as QnAMakerOptions);
    }

    /**
     * Invoked prior to a QnaMessage Event being logged.
     * @param qnaResult The QnA Results for the call.
     * @param turnContext Context object containing information for a single turn of conversation with a user.
     * @param telemetryProperties Additional properties to be logged to telemetry with the QnaMessage event.
     * @param telemetryMetrics Additional metrics to be logged to telemetry with the QnaMessage event.
     */
    protected async onQnaResults(qnaResults: QnAMakerResult[], turnContext: TurnContext, telemetryProperties?: {[key: string]:string}, telemetryMetrics?: {[key: string]:number}): Promise<void> {
        this.fillQnAEvent(qnaResults, turnContext, telemetryProperties, telemetryMetrics).then(data => {
            this.telemetryClient.trackEvent(
                { 
                  name: QnATelemetryConstants.qnaMessageEvent,
                  properties: data[0],
                  metrics: data[1]
                });
        });
        return;
    } 

    /**
     * Fills the event properties for QnaMessage event for telemetry.
     * These properties are logged when the recognizer is called.
     * @param qnaResult Last activity sent from user.
     * @param turnContext Context object containing information for a single turn of conversation with a user.
     * @param telemetryProperties Additional properties to be logged to telemetry with the QnaMessage event.
     * @returns A dictionary that is sent as properties to BotTelemetryClient.trackEvent method for the QnaMessage event.
     */
    protected async fillQnAEvent(qnaResults: QnAMakerResult[], turnContext: TurnContext, telemetryProperties?: {[key: string]:string}, telemetryMetrics?: {[key: string]:number}): Promise<[{[key: string]:string}, {[key: string]:number} ]> {
        var properties: { [key: string]: string } = {};
        var metrics: { [key: string]: number } = {};

        properties[QnATelemetryConstants.knowledgeBaseIdProperty] = this.endpoint.knowledgeBaseId;

        var text = turnContext.activity.text;
        var userName = ('from' in turnContext.activity) ? turnContext.activity.from.name : "";
        // Use the LogPersonalInformation flag to toggle logging PII data, text is a common example
        if (this.logPersonalInformation)
        {
            if (text)
            {
                properties[QnATelemetryConstants.questionProperty] = text;
            }
            if (userName)
            {
                properties[QnATelemetryConstants.usernameProperty] = userName;
            }
        }

        // Fill in Qna Results (found or not)
        if (qnaResults.length > 0)
        {
            var queryResult = qnaResults[0];
            properties[QnATelemetryConstants.matchedQuestionProperty] = JSON.stringify(queryResult.questions);
            properties[QnATelemetryConstants.questionIdProperty] = String(queryResult.id);
            properties[QnATelemetryConstants.answerProperty] = queryResult.answer;
            metrics[QnATelemetryConstants.scoreMetric] = queryResult.score;
            properties[QnATelemetryConstants.articleFoundProperty] = "true";
        }
        else
        {
            properties[QnATelemetryConstants.matchedQuestionProperty] = "No Qna Question matched";
            properties[QnATelemetryConstants.questionIdProperty] = "No Qna Question Id matched";
            properties[QnATelemetryConstants.answerProperty] =  "No Qna Answer matched";
            properties[QnATelemetryConstants.articleFoundProperty] = "false";
        }
        
        // Additional Properties can override "stock" properties.
        if (telemetryProperties != null)
        {
            properties = Object.assign({}, properties, telemetryProperties);
        }

        // Additional Metrics can override "stock" metrics.
        if (telemetryMetrics != null)
        {
            metrics = Object.assign({}, metrics, telemetryMetrics);
        }

        return [properties, metrics];
    }


    /**
     * Gets the message from the Activity in the TurnContext, trimmed of whitespaces.
     */
    private getTrimmedMessageText(context: TurnContext): string {
        const question: string = (context && context.activity && context.activity.text) ? context.activity.text : '';

        return question.trim();
    }
}
