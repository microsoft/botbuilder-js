/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { QnAMakerResult } from '../qnamaker-interfaces';

/** Previous Low Score Variation Multiplier. */
const PreviousLowScoreVariationMultiplier = 0.7;

/** Max Low Score Variation Multiplier. */
const MaxLowScoreVariationMultiplier = 1.0;

/**
 * Generate Answer api utils class.
 *
 * @summary
 * This class is helper class for generate answer api, which is used to make queries to a single QnA Maker knowledge base and return the result.
 */
export class ActiveLearningUtils {
    /** Minimum Score For Low Score Variation. */
    static MinimumScoreForLowScoreVariation = 20;

    /** Maximum Score For Low Score Variation. */
    static MaximumScoreForLowScoreVariation = 95.0;

    /**
     * Returns list of qnaSearch results which have low score variation.
     *
     * @param {QnAMakerResult[]} qnaSearchResults A list of results returned from the QnA getAnswer call.
     * @returns {QnAMakerResult[]} List of filtered qnaSearch results.
     */
    static getLowScoreVariation(qnaSearchResults: QnAMakerResult[]): QnAMakerResult[] {
        if (qnaSearchResults == null || qnaSearchResults.length == 0) {
            return [];
        }

        if (qnaSearchResults.length == 1) {
            return qnaSearchResults;
        }

        const filteredQnaSearchResult = [];
        const topAnswerScore = qnaSearchResults[0].score * 100;

        if (topAnswerScore > ActiveLearningUtils.MaximumScoreForLowScoreVariation) {
            filteredQnaSearchResult.push(qnaSearchResults[0]);
            return filteredQnaSearchResult;
        }

        let prevScore = topAnswerScore;

        if (topAnswerScore > ActiveLearningUtils.MinimumScoreForLowScoreVariation) {
            filteredQnaSearchResult.push(qnaSearchResults[0]);

            for (let i = 1; i < qnaSearchResults.length; i++) {
                if (
                    ActiveLearningUtils.includeForClustering(
                        prevScore,
                        qnaSearchResults[i].score * 100,
                        PreviousLowScoreVariationMultiplier
                    ) &&
                    this.includeForClustering(
                        topAnswerScore,
                        qnaSearchResults[i].score * 100,
                        MaxLowScoreVariationMultiplier
                    )
                ) {
                    prevScore = qnaSearchResults[i].score * 100;
                    filteredQnaSearchResult.push(qnaSearchResults[i]);
                }
            }
        }

        return filteredQnaSearchResult;
    }

    private static includeForClustering(prevScore, currentScore, multiplier): boolean {
        return prevScore - currentScore < multiplier * Math.sqrt(prevScore);
    }
}
