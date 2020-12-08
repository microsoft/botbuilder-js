/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { FeedbackRecords } from '../qnamaker-interfaces/feedbackRecords';
import { HttpRequestUtils } from './httpRequestUtils';
import { QnAMakerEndpoint } from '../qnamaker-interfaces/qnamakerEndpoint';
import { QnAMakerOptions } from '../qnamaker-interfaces';

/**
 * Generate Answer api utils class.
 *
 * @remarks
 * This class is helper class for generate answer api, which is used to make queries to a single QnA Maker knowledge base and return the result.
 */
export class TrainUtils {
    httpRequestUtils: HttpRequestUtils;

    /**
     * Creates new instance for active learning train utils.
     * @param endpoint The endpoint of the knowledge base to query.
     * @param options (Optional) QnAMaker options
     */
    constructor(private readonly endpoint: QnAMakerEndpoint, options?: QnAMakerOptions) {
        this.httpRequestUtils = new HttpRequestUtils(options?.agent);
    }

    /**
     * Train API to provide feedback.
     * @param feedbackRecords Feedback record list.
     */
    public async callTrain(feedbackRecords: FeedbackRecords) {
        if (!feedbackRecords) {
            throw new TypeError('Feedback records can not be null.');
        }

        if (!feedbackRecords.feedbackRecords || feedbackRecords.feedbackRecords.length == 0) {
            return;
        }

        await this.queryTrain(feedbackRecords);
    }

    /**
     * @private
     */
    private async queryTrain(feedbackRecords: FeedbackRecords) {
        const url = `${this.endpoint.host}/knowledgebases/${this.endpoint.knowledgeBaseId}/train`;
        const payloadBody = JSON.stringify({
            feedbackRecords: feedbackRecords.feedbackRecords,
        });

        await this.httpRequestUtils.executeHttpRequest(url, payloadBody, this.endpoint);
    }
}
