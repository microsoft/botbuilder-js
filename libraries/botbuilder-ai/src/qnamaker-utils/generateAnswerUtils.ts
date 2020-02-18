/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { TurnContext } from 'botbuilder-core';

import { QnAMakerResult } from '../qnamaker-interfaces/qnamakerResult';
import { QnAMakerResults } from '../qnamaker-interfaces/qnamakerResults';
import { QnAMakerEndpoint } from '../qnamaker-interfaces/qnamakerEndpoint';
import { QnAMakerOptions } from '../qnamaker-interfaces/qnamakerOptions';
import { QnAMakerTraceInfo } from '../qnamaker-interfaces/qnamakerTraceInfo';
import { QnARequestContext } from '../qnamaker-interfaces/qnaRequestContext';
import { HttpRequestUtils } from './httpRequestUtils';

import { QNAMAKER_TRACE_TYPE, QNAMAKER_TRACE_LABEL, QNAMAKER_TRACE_NAME } from '..';
import { RankerTypes } from '../qnamaker-interfaces/rankerTypes';

/**
 * Generate Answer api utils class.
 *
 * @remarks
 * This class is helper class for generate answer api, which is used to make queries to a single QnA Maker knowledge base and return the result.
 */
export class GenerateAnswerUtils {
    httpRequestUtils: HttpRequestUtils;
    
    /**
     * Creates new Generate answer utils.
     * @param _options Settings used to configure the instance.
     * @param endpoint The endpoint of the knowledge base to query.
     */
    constructor (public _options: QnAMakerOptions, private readonly endpoint: QnAMakerEndpoint) {
        this.httpRequestUtils = new HttpRequestUtils();

        this.validateOptions(this._options);
    }

    /**
     * Called internally to query the QnA Maker service.
     * @param endpoint The endpoint of the knowledge base to query.
     * @param question Question which need to be queried.
     * @param options (Optional) The options for the QnA Maker knowledge base. If null, constructor option is used for this instance.
     */
    public async queryQnaService(endpoint: QnAMakerEndpoint, question: string, options?: QnAMakerOptions): Promise<QnAMakerResult[]> {
        var result = await this.queryQnaServiceRaw(endpoint, question, options);
        
        return result.answers;
    }

    /**
     * Called internally to query the QnA Maker service.
     * @param endpoint The endpoint of the knowledge base to query.
     * @param question Question which need to be queried.
     * @param options (Optional) The options for the QnA Maker knowledge base. If null, constructor option is used for this instance.
     */
    public async queryQnaServiceRaw(endpoint: QnAMakerEndpoint, question: string, options?: QnAMakerOptions): Promise<QnAMakerResults> {
        const url: string = `${ endpoint.host }/knowledgebases/${ endpoint.knowledgeBaseId }/generateanswer`;
        var queryOptions: QnAMakerOptions = { ...this._options, ...options } as QnAMakerOptions;
        
        queryOptions.rankerType = !queryOptions.rankerType ? RankerTypes.default : queryOptions.rankerType;
        this.validateOptions(queryOptions);

        var payloadBody = JSON.stringify({
            question: question,
            ...queryOptions
        });

        const qnaResultJson: any = await this.httpRequestUtils.executeHttpRequest(url, payloadBody, this.endpoint, queryOptions.timeout);
        
        return this.formatQnaResult(qnaResultJson);
    }
    
    /**
     * Emits a trace event detailing a QnA Maker call and its results.
     *
     * @param turnContext Turn Context for the current turn of conversation with the user.
     * @param answers Answers returned by QnA Maker.
     * @param options (Optional) The options for the QnA Maker knowledge base. If null, constructor option is used for this instance.
     */
    public async emitTraceInfo(turnContext: TurnContext, answers: QnAMakerResult[], queryOptions?: QnAMakerOptions): Promise<any> {
        const requestOptions: QnAMakerOptions = { ...this._options, ...queryOptions };
        const { scoreThreshold, top, strictFilters, metadataBoost, context, qnaId } = requestOptions;

        const traceInfo: QnAMakerTraceInfo = {
            message: turnContext.activity,
            queryResults: answers,
            knowledgeBaseId: this.endpoint.knowledgeBaseId,
            scoreThreshold,
            top,
            strictFilters,
            metadataBoost,
            context,
            qnaId,
        };

        return turnContext.sendActivity({
            type: 'trace',
            valueType: QNAMAKER_TRACE_TYPE,
            name: QNAMAKER_TRACE_NAME,
            label: QNAMAKER_TRACE_LABEL,
            value: traceInfo
        });
    }
    
    /**
     * Validate qna maker options
     *
     * @param options (Optional) The options for the QnA Maker knowledge base. If null, constructor option is used for this instance.
     */
    public validateOptions(options: QnAMakerOptions) {
        const { scoreThreshold, top, rankerType } = options;

        if (scoreThreshold) {
            this.validateScoreThreshold(scoreThreshold);
        }

        if (top) {
            this.validateTop(top);
        }
    }
    
    /**
     * Sorts all QnAMakerResult from highest-to-lowest scoring.
     * Filters QnAMakerResults within threshold specified (default threshold: .001).
     * 
     * @param answers Answers returned by QnA Maker.
     * @param options (Optional) The options for the QnA Maker knowledge base. If null, constructor option is used for this instance.
     */
    public static sortAnswersWithinThreshold(answers: QnAMakerResult[] = [] as QnAMakerResult[], queryOptions: QnAMakerOptions): QnAMakerResult[] {
        const minScore: number = typeof queryOptions.scoreThreshold === 'number' ? queryOptions.scoreThreshold : 0.001;

        return answers.filter((ans: QnAMakerResult) => ans.score >= minScore)
            .sort((a: QnAMakerResult, b: QnAMakerResult) => b.score - a.score);
    }
    
    private formatQnaResult(qnaResult: any): QnAMakerResults {
        qnaResult.answers = qnaResult.answers.map((ans: any) => {
            ans.score = ans.score / 100;

            if (ans.qnaId) {
                ans.id = ans.qnaId;
                delete ans.qnaId;
            }

            return ans as QnAMakerResult;
        });

        qnaResult.activeLearningEnabled = (qnaResult.activeLearningEnabled != null) ? qnaResult.activeLearningEnabled : true;

        return qnaResult;
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
}