/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { QnAMakerEndpoint } from '../qnamaker-interfaces/qnamakerEndpoint';
import { FeedbackRecords } from '../qnamaker-interfaces/feedbackRecords';
import { HttpRequestUtils } from './httpRequestUtils';

/**
 * Generate Answer api utils class.
 *
 * @summary
 * This class is helper class for generate answer api, which is used to make queries to a single QnA Maker knowledge base and return the result.
 */
export class TrainUtils {
    httpRequestUtils: HttpRequestUtils;

    /**
     * Creates new instance for active learning train utils.
     *
     * @param {QnAMakerEndpoint} endpoint The endpoint of the knowledge base to query.
     */
    constructor(private readonly endpoint: QnAMakerEndpoint) {
        this.httpRequestUtils = new HttpRequestUtils();
    }

    /**
     * Train API to provide feedback.
     *
     * @param {FeedbackRecords} feedbackRecords Feedback record list.
     */
    async callTrain(feedbackRecords: FeedbackRecords): Promise<void> {
        if (!feedbackRecords) {
            throw new TypeError('Feedback records can not be null.');
        }

        if (!feedbackRecords.feedbackRecords || feedbackRecords.feedbackRecords.length == 0) {
            return;
        }

        await this.queryTrain(feedbackRecords);
    }

    private async queryTrain(feedbackRecords: FeedbackRecords) {
        const url = `${this.endpoint.host}/knowledgebases/${this.endpoint.knowledgeBaseId}/train`;
        const payloadBody = JSON.stringify({
            feedbackRecords: feedbackRecords.feedbackRecords,
        });

        await this.httpRequestUtils.executeHttpRequest(url, payloadBody, this.endpoint);
    }
}
