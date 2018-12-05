/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */
import {  Activity, TurnContext } from 'botbuilder';
import * as entities from 'html-entities';
import * as request from 'request-promise-native';
import { isContext } from 'vm';
const pjson: any = require('../package.json');
import * as os from 'os';

const QNAMAKER_TRACE_TYPE: string = 'https://www.qnamaker.ai/schemas/trace';
const QNAMAKER_TRACE_NAME: string = 'QnAMaker';
const QNAMAKER_TRACE_LABEL: string = 'QnAMaker Trace';

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
     * (Optional) Filters used on query. Not used in JavaScript SDK v4 yet.
     */
    strictFilters?: QnAMakerMetadata[];

    /**
     * (Optional) Metadata related to query. Not used in JavaScript SDK v4 yet.
     */
    metadataBoost?: QnAMakerMetadata[];
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


/**
 * Query a QnA Maker knowledge base for answers.
 *
 * @remarks
 * This class is used to make queries to a single QnA Maker knowledge base and return the result.
 *
 * Use this to process incoming messages with the [getAnswers()](#getAnswers) method.
 */
export class QnAMaker {
    private readonly _options: QnAMakerOptions;

    /**
     * Creates a new QnAMaker instance.
     * @param endpoint The endpoint of the knowledge base to query.
     * @param options (Optional) additional settings used to configure the instance.
     */
    constructor(private readonly endpoint: QnAMakerEndpoint, options: QnAMakerOptions = {} as QnAMakerOptions) {

        const { 
            scoreThreshold = 0.3,
            top = 1,
            strictFilters = [] as QnAMakerMetadata[],
            metadataBoost = [] as QnAMakerMetadata[]
        } = options;

        this._options = { 
            scoreThreshold, 
            top, 
            strictFilters,
            metadataBoost 
        } as QnAMakerOptions;
    }

    /**
     * Calls [generateAnswer()](#generateanswer) and sends the resulting answer as a reply to the user.
     *
     * @remarks
     * Returns a value of `true` if an answer was found and sent. If multiple answers are
     * returned the first one will be delivered.
     * @param context Context for the current turn of conversation with the user.
     */
    public async answer(context: TurnContext): Promise<boolean> {
        const { top, scoreThreshold } = this._options;
        const answers: QnAMakerResult[] = await this.generateAnswer(context.activity.text, top, scoreThreshold);

        await this.emitTraceInfo(context, answers);

        if (answers.length > 0) {
            await context.sendActivity({ text: answers[0].answer, type: 'message' });

            return true;
        } 
        
        return false;
    }

    /**
     * Calls the QnA Maker service to generate answer(s) for a question.
     *
     * @deprecated  Instead, favor using [QnAMaker.getAnswers()](#getAnswers) to generate answers for a question.
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
            const answers = await this.callService(this.endpoint, question, typeof top === 'number' ? top : 1);
            const minScore: number = typeof scoreThreshold === 'number' ? scoreThreshold : 0.001;

            return answers.filter(
                (ans: QnAMakerResult) => ans.score >= minScore
            ).sort(
                (a: QnAMakerResult, b: QnAMakerResult) => b.score - a.score
            );
        }

        return [] as QnAMakerResult[];
    }

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
     */
    public async getAnswers(context: TurnContext, options?: QnAMakerOptions): Promise<QnAMakerResult[]> {
        const queryOptions = { ...this._options, ...options } as QnAMakerOptions;

        const question: string = context && context.activity ? context.activity.text : '';
        const trimmedQuestion: string = question ? question.trim() : '';
        if (trimmedQuestion.length > 0) {
            const answers: QnAMakerResult[] = await this.queryQnaService(this.endpoint, trimmedQuestion, queryOptions);
            const minScore: number = typeof queryOptions.scoreThreshold === 'number' ? queryOptions.scoreThreshold : 0.001;
            const sortedQnaAnswers = answers.filter(
                (ans: QnAMakerResult) => ans.score >= minScore
            ).sort(
                (a: QnAMakerResult, b: QnAMakerResult) => b.score - a.score
            );
            this.emitTraceInfo(context, sortedQnaAnswers);

            return sortedQnaAnswers;
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
     * Called internally to query the QnA Maker service.
     */
    private async queryQnaService(endpoint: QnAMakerEndpoint, question: string, options?: QnAMakerOptions): Promise<QnAMakerResult[]> {
        const url: string = `${endpoint.host}/knowledgebases/${endpoint.knowledgeBaseId}/generateanswer`;
        const headers: any = {};
        const isLegacyProtocol = endpoint.host.endsWith('v2.0') || endpoint.host.endsWith('v3.0');
        const queryOptions = { ...this._options, ...options } as QnAMakerOptions;

        if (isLegacyProtocol) {
            headers['Ocp-Apim-Subscription-Key'] = endpoint.endpointKey;
        } else {
            headers.Authorization = `EndpointKey ${endpoint.endpointKey}`;
        }

        headers['User-Agent'] = this.getUserAgent();

        const qnaResult = await request({
            url: url,
            method: 'POST',
            headers: headers,
            json: {
                question: question,
                ...queryOptions
            }
        });

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

    private getUserAgent() : string {
        const packageUserAgent = `${pjson.name}/${pjson.version}`;
        const platformUserAgent = `(${os.arch()}-${os.type()}-${os.release()}; Node.js,Version=${process.version})`;
        const userAgent = `${packageUserAgent} ${platformUserAgent}`;
        
        return userAgent;
   }

    /**
     * Emits a trace event detailing a QnA Maker call and its results.
     *
     * @param context Context for the current turn of conversation with the user.
     * @param answers Answers returned by QnA Maker.
     */
    private emitTraceInfo(context: TurnContext, answers: QnAMakerResult[]): Promise<any> {
        const traceInfo: QnAMakerTraceInfo = {
            message: context.activity,
            queryResults: answers,
            knowledgeBaseId: this.endpoint.knowledgeBaseId,
            scoreThreshold: this._options.scoreThreshold,
            top: this._options.top,
            strictFilters: [{}],
            metadataBoost: [{}]
        };

        return context.sendActivity({
            type: 'trace',
            valueType: QNAMAKER_TRACE_TYPE,
            name: QNAMAKER_TRACE_NAME,
            label: QNAMAKER_TRACE_LABEL,
            value: traceInfo
        });
    }
}
