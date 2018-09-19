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

const QNAMAKER_TRACE_TYPE: string = 'https://www.qnamaker.ai/schemas/trace';
const QNAMAKER_TRACE_NAME: string = 'QnAMaker';
const QNAMAKER_TRACE_LABEL: string = 'QnAMaker Trace';

/**
 * @private
 */
const htmlentities: entities.AllHtmlEntities = new entities.AllHtmlEntities();

/**
 * An individual answer returned by `QnAMaker.generateAnswer()`.
 */
export interface QnAMakerResult {
    /**
     * The list of questions indexed in the QnA Service for the given answer.
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
     * Metadata associated with the answer
     */
    metadata?: any;

    /**
     * The source from which the QnA was extracted
     */
    source?: string;

    /**
     * The index of the answer in the knowledge base. V3 uses 'qnaId', V4 uses 'id'.
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
}

/**
 * Trace info that we collect and emit from a QnA Maker query
 */
export interface QnAMakerTraceInfo {
    // Message which instigated the query to QnA Maker
    message: Activity;
    // Results that QnA Maker returned
    queryResults: QnAMakerResult[];
    // ID of the knowledge base that is being queried
    knowledgeBaseId: string;
    // The minimum score threshold, used to filter returned results
    scoreThreshold: number;
    // Number of ranked results that are asked to be returned
    top: number;
    // Filters used on query. Not used in JavaScript SDK v4 yet
    strictFilters: any[];
    // Metadata related to query. Not used in JavaScript SDK v4 yet
    metadataBoost: any[];
}

/**
 * Manages querying an individual QnA Maker knowledge base for answers.
 */
export class QnAMaker {
    private readonly options: QnAMakerOptions;

    /**
     * Creates a new QnAMaker instance.
     * @param endpoint The endpoint of the knowledge base to query.
     * @param options (Optional) additional settings used to configure the instance.
     */
    constructor(private readonly endpoint: QnAMakerEndpoint, options?: QnAMakerOptions) {
        // Initialize options
        this.options = {
            scoreThreshold: 0.3,
            top: 1,
            ...options
        } as QnAMakerOptions;
    }

    /**
     * Calls [generateAnswer()](#generateanswer) and sends the answer as a message to the user.
     *
     * @remarks
     * Returns a value of `true` if an answer was found and sent. If multiple answers are
     * returned the first one will be delivered.
     * @param context Context for the current turn of conversation with the user.
     */
    public answer(context: TurnContext): Promise<boolean> {
        const { top, scoreThreshold } = this.options;

        return this.generateAnswer(context.activity.text, top, scoreThreshold).then((answers: QnAMakerResult[]) => {
            return this.emitTraceInfo(context, answers).then(() => {
                if (answers.length > 0) {
                    return context.sendActivity({ text: answers[0].answer, type: 'message' }).then(() => true);
                } else {
                    return Promise.resolve(false);
                }
            });
        });
    }

    /**
     * Calls the QnA Maker service to generate answer(s) for a question.
     *
     * @remarks
     * The returned answers will be sorted by score with the top scoring answer returned first.
     * @param question The question to answer.
     * @param top (Optional) number of answers to return. Defaults to a value of `1`.
     * @param scoreThreshold (Optional) minimum answer score needed to be considered a match to questions. Defaults to a value of `0.001`.
     */
    public generateAnswer(question: string|undefined, top?: number, scoreThreshold?: number): Promise<QnAMakerResult[]> {
        const q: string = question ? question.trim() : '';
        if (q.length > 0) {
            return this.callService(this.endpoint, question, typeof top === 'number' ? top : 1).then((answers: QnAMakerResult[]) => {
                const minScore: number = typeof scoreThreshold === 'number' ? scoreThreshold : 0.001;

                return answers.filter(
                    (ans: QnAMakerResult) => ans.score >= minScore
                ).sort(
                    (a: QnAMakerResult, b: QnAMakerResult) => b.score - a.score
                );
            });
        }

        return Promise.resolve([]);
    }

    /**
     * Called internally to query the QnA Maker service.
     *
     * @remarks
     * This is exposed to enable better unit testing of the service.
     */
    protected callService(endpoint: QnAMakerEndpoint, question: string, top: number): Promise<QnAMakerResult[]> {
        const url: string = `${endpoint.host}/knowledgebases/${endpoint.knowledgeBaseId}/generateanswer`;
        const headers: any = {};
        if (endpoint.host.endsWith('v2.0') || endpoint.host.endsWith('v3.0')) {
            headers['Ocp-Apim-Subscription-Key'] = endpoint.endpointKey;
        } else {
            headers.Authorization = `EndpointKey ${endpoint.endpointKey}`;
        }

        return request({
            url: url,
            method: 'POST',
            headers: headers,
            json: {
                question: question,
                top: top
            }
        }).then((result: any) => {
            return result.answers.map((ans: any) => {
                ans.score = ans.score / 100;
                ans.answer = htmlentities.decode(ans.answer);
                if (ans.qnaId) {
                    ans.id = ans.qnaId;
                    delete ans.qnaId;
                }

                return ans as QnAMakerResult;
            });
        });
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
            scoreThreshold: this.options.scoreThreshold,
            top: this.options.top,
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
