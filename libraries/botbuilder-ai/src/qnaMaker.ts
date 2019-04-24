/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import { Activity, TurnContext, BotTelemetryClient, NullTelemetryClient } from 'botbuilder-core';
import * as entities from 'html-entities';
import * as os from 'os';
const pjson: any = require('../package.json');
import * as request from 'request-promise-native';
import { constants } from 'http2';
import { QnATelemetryConstants } from './qnaTelemetryConstants';

const QNAMAKER_TRACE_TYPE = 'https://www.qnamaker.ai/schemas/trace';
const QNAMAKER_TRACE_NAME = 'QnAMaker';
const QNAMAKER_TRACE_LABEL = 'QnAMaker Trace';

/**
 * @private
 */
const htmlentities: entities.AllHtmlEntities = new entities.AllHtmlEntities();

/**
 * An individual answer returned by a call to the QnA Maker Service.
 */
export interface QnAMakerResult {
    /**
     * The list of questions indexed in the QnA Service for the given answer. (If any)
     */
    questions?: string[];

    /**
     * Answer from the knowledge base.
     */
    answer: string;

    /**
     * Confidence on a scale from 0.0 to 1.0 that the answer matches the users intent.
     */
    score: number;

    /**
     * Metadata associated with the answer (If any)
     */
    metadata?: any;

    /**
     * The source from which the QnA was extracted (If any)
     */
    source?: string;

    /**
     * The index of the answer in the knowledge base. V3 uses 'qnaId', V4 uses 'id'. (If any)
     */
    id?: number;
}

/**
 * Defines an endpoint used to connect to a QnA Maker Knowledge base.
 */
export interface QnAMakerEndpoint {
    /**
     * ID of your knowledge base. For example: `98185f59-3b6f-4d23-8ebb-XXXXXXXXXXXX`
     */
    knowledgeBaseId: string;

    /**
     * Your endpoint key. For `v2` or `v3` knowledge bases this is your subscription key.
     * For example: `4cb65a02697745eca369XXXXXXXXXXXX`
     */
    endpointKey: string;

    /**
     * The host path. For example: `https://westus.api.cognitive.microsoft.com/qnamaker/v2.0`
     */
    host: string;
}

/**
 * Additional settings used to configure a `QnAMaker` instance.
 */
export interface QnAMakerOptions {
    /**
     * (Optional) minimum score accepted.
     *
     * @remarks
     * Defaults to "0.3".
     */
    scoreThreshold?: number;

    /**
     * (Optional) number of results to return.
     *
     * @remarks
     * Defaults to "1".
     */
    top?: number;

    /**
     * (Optional) Filters used on query.
     */
    strictFilters?: QnAMakerMetadata[];

    /**
     * (Optional) Metadata related to query.
     */
    metadataBoost?: QnAMakerMetadata[];

    /** (Optional) The time in milliseconds to wait before the request times out.
     * 
     * @remarks Defaults to "100000" milliseconds.
    */
   timeout?: number;
}

/**
 * Trace info that we collect and emit from a QnA Maker query
 */
export interface QnAMakerTraceInfo {
    /**
     *  Message which instigated the query to QnA Maker.
     */
    message: Activity;

    /**
     *  Results that QnA Maker returned.
     */
    queryResults: QnAMakerResult[];

    /**
     *  ID of the knowledge base that is being queried.
     */
    knowledgeBaseId: string;

    /**
     * The minimum score threshold, used to filter returned results.
     */
    scoreThreshold: number;

    /**
     *  Number of ranked results that are asked to be returned.
     */
    top: number;

    /**
     * Filters used on query. Not used in JavaScript SDK v4 yet.
     */
    strictFilters: any[];

    /**
     * Metadata related to query. Not used in JavaScript SDK v4 yet.
     */
    metadataBoost: any[];
}

/**
 * Metadata associated with the answer.
 */
export interface QnAMakerMetadata {
    /**
     * Metadata name. Max length: 100.
     */
    name: string;

    /**
     * Metadata value. Max length: 100.
     */
    value: string;
}

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
 * Query a QnA Maker knowledge base for answers.
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

        this.validateOptions(this._options);

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

        const queryResult: QnAMakerResult[] = [] as QnAMakerResult[];
        const question: string = this.getTrimmedMessageText(context);
        const queryOptions: QnAMakerOptions = { ...this._options, ...options } as QnAMakerOptions;

        this.validateOptions(queryOptions);

        if (question.length > 0) {
            const answers: QnAMakerResult[] = await this.queryQnaService(this.endpoint, question, queryOptions);
            const sortedQnaAnswers: QnAMakerResult[] = this.sortAnswersWithinThreshold(answers, queryOptions);

            queryResult.push(...sortedQnaAnswers);
        }

        // Log telemetry
        this.onQnaResults(queryResult, context, telemetryProperties, telemetryMetrics);

        await this.emitTraceInfo(context, queryResult, queryOptions);

        return queryResult;
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

        await this.emitTraceInfo(context, answers, this._options);

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
            const answers: QnAMakerResult[] = await this.callService(this.endpoint, question, typeof top === 'number' ? top : 1);
            const minScore: number = typeof scoreThreshold === 'number' ? scoreThreshold : 0.001;

            return answers.filter(
                (ans: QnAMakerResult) => ans.score >= minScore)
                .sort((a: QnAMakerResult, b: QnAMakerResult) => b.score - a.score);
        }

        return [] as QnAMakerResult[];
    }

    /**
     * Called internally to query the QnA Maker service.
     *
     * @remarks
     * This is exposed to enable better unit testing of the service.
     */
    protected async callService(endpoint: QnAMakerEndpoint, question: string, top: number): Promise<QnAMakerResult[]> {
        return this.queryQnaService(endpoint, question, { top } as QnAMakerOptions);
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
            properties[QnATelemetryConstants.questionIdProperty] = "No QnA Question Id matched";
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

    /**
     * Called internally to query the QnA Maker service.
     */
    private async queryQnaService(endpoint: QnAMakerEndpoint, question: string, options?: QnAMakerOptions): Promise<QnAMakerResult[]> {
        const url: string = `${ endpoint.host }/knowledgebases/${ endpoint.knowledgeBaseId }/generateanswer`;
        const headers: any = this.getHeaders(endpoint);
        const queryOptions: QnAMakerOptions = { ...this._options, ...options } as QnAMakerOptions;

        this.validateOptions(queryOptions);

        const qnaResult: any = await request({
            url: url,
            method: 'POST',
            headers: headers,
            timeout: queryOptions.timeout,
            json: {
                question: question,
                ...queryOptions
            }
        });

        return this.formatQnaResult(qnaResult);
    }

    /**
     * Sorts all QnAMakerResult from highest-to-lowest scoring.
     * Filters QnAMakerResults within threshold specified (default threshold: .001).
     */
    private sortAnswersWithinThreshold(answers: QnAMakerResult[] = [] as QnAMakerResult[], queryOptions: QnAMakerOptions): QnAMakerResult[] {
        const minScore: number = typeof queryOptions.scoreThreshold === 'number' ? queryOptions.scoreThreshold : 0.001;

        return answers.filter((ans: QnAMakerResult) => ans.score >= minScore)
            .sort((a: QnAMakerResult, b: QnAMakerResult) => b.score - a.score);
    }

    /**
     * Emits a trace event detailing a QnA Maker call and its results.
     *
     * @param context Context for the current turn of conversation with the user.
     * @param answers Answers returned by QnA Maker.
     */
    private async emitTraceInfo(context: TurnContext, answers: QnAMakerResult[], queryOptions: QnAMakerOptions): Promise<any> {
        const requestOptions: QnAMakerOptions = { ...this._options, ...queryOptions };
        const { scoreThreshold, top, strictFilters, metadataBoost } = requestOptions;

        const traceInfo: QnAMakerTraceInfo = {
            message: context.activity,
            queryResults: answers,
            knowledgeBaseId: this.endpoint.knowledgeBaseId,
            scoreThreshold,
            top,
            strictFilters,
            metadataBoost
        };

        return context.sendActivity({
            type: 'trace',
            valueType: QNAMAKER_TRACE_TYPE,
            name: QNAMAKER_TRACE_NAME,
            label: QNAMAKER_TRACE_LABEL,
            value: traceInfo
        });
    }

    /**
     * Sets headers for request to QnAMaker service.
     *
     * The [QnAMakerEndpointKey](#QnAMakerEndpoint.QnAMakerEndpointKey) is set as the value of
     * `Authorization` header for v4.0 and later of QnAMaker service.
     *
     * Legacy QnAMaker services use the `Ocp-Apim-Subscription-Key` header for the QnAMakerEndpoint value instead.
     *
     * [QnAMaker.getHeaders()](#QnAMaker.getHeaders) also gets the User-Agent header value.
     */
    private getHeaders(endpoint: QnAMakerEndpoint): any {
        const headers: any = {};
        const isLegacyProtocol: boolean = endpoint.host.endsWith('v2.0') || endpoint.host.endsWith('v3.0');

        if (isLegacyProtocol) {
            headers['Ocp-Apim-Subscription-Key'] = endpoint.endpointKey;
        } else {
            headers.Authorization = `EndpointKey ${ endpoint.endpointKey }`;
        }

        headers['User-Agent'] = this.getUserAgent();

        return headers;
    }

    private getUserAgent(): string {
        const packageUserAgent: string = `${ pjson.name }/${ pjson.version }`;
        const platformUserAgent: string = `(${ os.arch() }-${ os.type() }-${ os.release() }; Node.js,Version=${ process.version })`;

        return `${ packageUserAgent } ${ platformUserAgent }`;
    }

    private validateOptions(options: QnAMakerOptions): void {
        const { scoreThreshold, top } = options;

        if (scoreThreshold) {
            this.validateScoreThreshold(scoreThreshold);
        }

        if (top) {
            this.validateTop(top);
        }
    }

    private validateScoreThreshold(scoreThreshold: number): void {
        if (typeof scoreThreshold !== 'number' || !(scoreThreshold > 0 && scoreThreshold < 1)) {
            throw new TypeError(
                `"${ scoreThreshold }" is an invalid scoreThreshold. QnAMakerOptions.scoreThreshold must have a value between 0 and 1.`
            );
        }
    }

    private validateTop(qnaOptionTop: number): void {
        if (!Number.isInteger(qnaOptionTop) || qnaOptionTop < 1) {
            throw new RangeError(`"${ qnaOptionTop }" is an invalid top value. QnAMakerOptions.top must be an integer greater than 0.`);
        }
    }

    private formatQnaResult(qnaResult: any): QnAMakerResult[] {
        return qnaResult.answers.map((ans: any) => {
            ans.score = ans.score / 100;
            ans.answer = htmlentities.decode(ans.answer);

            if (ans.qnaId) {
                ans.id = ans.qnaId;
                delete ans.qnaId;
            }

            return ans as QnAMakerResult;
        });
    }
}
