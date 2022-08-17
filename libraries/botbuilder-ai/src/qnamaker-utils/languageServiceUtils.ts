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
import { HttpRequestUtils } from './httpRequestUtils';

import {
    QNAMAKER_TRACE_TYPE,
    QNAMAKER_TRACE_LABEL,
    QNAMAKER_TRACE_NAME,
    FeedbackRecords,
    FeedbackRecord,
    QnAMakerMetadata,
    JoinOperator,
} from '..';
import { RankerTypes } from '../qnamaker-interfaces/rankerTypes';
import { Filters } from '../qnamaker-interfaces/filters';
import { KnowledgeBaseAnswers } from '../qnamaker-interfaces/knowledgeBaseAnswers';
import { KnowledgeBaseAnswer } from '../qnamaker-interfaces/knowledgeBaseAnswer';

const ApiVersionQueryParam = 'api-version=2021-10-01';

/**
 * Utilities for using Query Knowledge Base and Add Active Learning feedback APIs of language service.
 *
 * @summary
 * This class is helper class for query-knowledgebases api, used to make queries to a Language service project and returns the knowledgebase answers.
 */
export class LanguageServiceUtils {
    httpRequestUtils: HttpRequestUtils;

    /**
     * Creates new Language Service utils.
     *
     * @param {QnAMakerOptions} _options Settings used to configure the instance.
     * @param {QnAMakerEndpoint} endpoint The endpoint of the knowledge base to query.
     */
    constructor(public _options: QnAMakerOptions, readonly endpoint: QnAMakerEndpoint) {
        this.httpRequestUtils = new HttpRequestUtils();

        this.validateOptions(this._options);
    }

    /**
     * Adds feedback to the knowledge base.
     *
     * @param feedbackRecords A list of Feedback Records for Active Learning.
     * @returns {Promise<void>} A promise representing the async operation.
     */
    async addFeedback(feedbackRecords: FeedbackRecords): Promise<void> {
        if (!feedbackRecords) {
            throw new TypeError('Feedback records can not be null.');
        }

        if (!feedbackRecords.feedbackRecords || feedbackRecords.feedbackRecords.length == 0) {
            return;
        }

        await this.addFeedbackRecordsToKnowledgebase(feedbackRecords.feedbackRecords);
    }

    /**
     * Called to query the Language service.
     *
     * @param {string} question Question which need to be queried.
     * @param {QnAMakerOptions} options (Optional) The options for the QnA Maker knowledge base. If null, constructor option is used for this instance.
     * @returns {Promise<QnAMakerResult[]>} a promise that resolves to the raw query results
     */
    async queryKnowledgebaseRaw(question: string, options?: QnAMakerOptions): Promise<QnAMakerResults> {
        const deploymentName = options.isTest ? 'test' : 'production';
        const url = `${this.endpoint.host}/language/:query-knowledgebases?projectName=${this.endpoint.knowledgeBaseId}&deploymentName=${deploymentName}&${ApiVersionQueryParam}`;
        const queryOptions: QnAMakerOptions = { ...this._options, ...options } as QnAMakerOptions;

        queryOptions.rankerType = !queryOptions.rankerType ? RankerTypes.default : queryOptions.rankerType;
        this.validateOptions(queryOptions);

        const payloadBody = JSON.stringify({
            question: question,
            confidenceScoreThreshold: queryOptions.scoreThreshold,
            top: queryOptions.top,
            filters: this.getFilters(
                queryOptions.strictFilters,
                queryOptions.strictFiltersJoinOperator,
                queryOptions.filters
            ),
            qnaId: queryOptions.qnaId,
            rankerType: queryOptions.rankerType,
            context: queryOptions.context,
            answerSpanRequest: { enable: queryOptions.enablePreciseAnswer },
            includeUnstructuredSources: queryOptions.includeUnstructuredSources,
        });

        const qnaResults = await this.httpRequestUtils.executeHttpRequest(
            url,
            payloadBody,
            this.endpoint,
            queryOptions.timeout
        );

        if (Array.isArray(qnaResults?.answers)) {
            return this.formatQnaResult(qnaResults as KnowledgeBaseAnswers);
        }

        throw new Error(`Failed to query knowledgebase: ${qnaResults}`);
    }

    /**
     * Emits a trace event detailing a Custom Question Answering call and its results.
     *
     * @param {TurnContext} turnContext Turn Context for the current turn of conversation with the user.
     * @param {QnAMakerResult[]} answers Answers returned by Language Service.
     * @param {QnAMakerOptions} queryOptions (Optional) The options for the Custom Question Answering knowledge base. If null, constructor option is used for this instance.
     * @returns {Promise<any>} a promise representing the async operation
     */
    async emitTraceInfo(
        turnContext: TurnContext,
        answers: QnAMakerResult[],
        queryOptions?: QnAMakerOptions
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ): Promise<any> {
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
            value: traceInfo,
        });
    }

    /**
     * Validate qna maker options
     *
     * @param {QnAMakerOptions} options The options for the Custom Question Answering knowledge base. If null, constructor option is used for this instance.
     */
    validateOptions(options: QnAMakerOptions): void {
        const { scoreThreshold, top } = options;

        if (scoreThreshold) {
            this.validateScoreThreshold(scoreThreshold);
        }

        if (top) {
            this.validateTop(top);
        }
    }

    private formatQnaResult(kbAnswers: KnowledgeBaseAnswers): QnAMakerResults {
        const qnaResultsAnswers = kbAnswers.answers?.map((kbAnswer: KnowledgeBaseAnswer) => {
            const qnaResult: QnAMakerResult = {
                answer: kbAnswer.answer,
                score: kbAnswer.confidenceScore,
                metadata: kbAnswer.metadata
                    ? Object.entries(kbAnswer.metadata).map((nv) => {
                          return { name: nv[0], value: nv[1] };
                      })
                    : null,
                answerSpan: kbAnswer?.answerSpan
                    ? {
                          text: kbAnswer.answerSpan.text,
                          score: kbAnswer.answerSpan.confidenceScore,
                          startIndex: kbAnswer.answerSpan.offset,
                          endIndex: kbAnswer.answerSpan.offset + kbAnswer.answerSpan.length - 1,
                      }
                    : null,
                context: kbAnswer?.dialog
                    ? {
                          prompts: kbAnswer.dialog?.prompts?.map((p) => {
                              return {
                                  displayOrder: p.displayOrder,
                                  displayText: p.displayText,
                                  qna: null,
                                  qnaId: p.qnaId,
                              };
                          }),
                      }
                    : null,
                id: kbAnswer.id,
                questions: kbAnswer.questions,
                source: kbAnswer.source,
            };

            return qnaResult;
        });

        const qnaResults = { answers: qnaResultsAnswers, activeLearningEnabled: true };
        return qnaResults;
    }

    private validateScoreThreshold(scoreThreshold: number): void {
        if (typeof scoreThreshold !== 'number' || !(scoreThreshold > 0 && scoreThreshold <= 1)) {
            throw new TypeError(
                `"${scoreThreshold}" is an invalid scoreThreshold. QnAMakerOptions.scoreThreshold must have a value between 0 and 1.`
            );
        }
    }

    private validateTop(qnaOptionTop: number): void {
        if (!Number.isInteger(qnaOptionTop) || qnaOptionTop < 1) {
            throw new RangeError(
                `"${qnaOptionTop}" is an invalid top value. QnAMakerOptions.top must be an integer greater than 0.`
            );
        }
    }

    private getFilters(
        strictFilters: QnAMakerMetadata[],
        metadataJoinOperator: JoinOperator,
        filters: Filters
    ): Filters {
        if (filters) {
            return filters;
        }

        if (strictFilters) {
            const metadataKVPairs = [];
            strictFilters.forEach((filter) => {
                metadataKVPairs.push({ key: filter.name, value: filter.value });
            });
            const newFilters = {
                metadataFilter: {
                    metadata: metadataKVPairs,
                    logicalOperation: metadataJoinOperator ? metadataJoinOperator.toString() : JoinOperator.AND,
                },
                sourceFilter: [],
                logicalOperation: JoinOperator.AND.toString(),
            };

            return newFilters;
        }

        return null;
    }

    private async addFeedbackRecordsToKnowledgebase(records: FeedbackRecord[]) {
        const url = `${this.endpoint.host}/language/query-knowledgebases/projects/${this.endpoint.knowledgeBaseId}/feedback?${ApiVersionQueryParam}`;
        const payloadBody = JSON.stringify({
            records: records,
        });

        await this.httpRequestUtils.executeHttpRequest(url, payloadBody, this.endpoint);
    }
}
