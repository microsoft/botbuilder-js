/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { QnAMakerResult } from '../qnamaker-interfaces/qnamakerResult';

// Minimum Score For Low Score Variation
const MinimumScoreForLowScoreVariation = 20;

// Previous Low Score Variation Multiplier
const PreviousLowScoreVariationMultiplier = 0.7;

// Max Low Score Variation Multiplier
const MaxLowScoreVariationMultiplier = 1.0;

// Maximum Score For Low Score Variation
const MaximumScoreForLowScoreVariation = 95.0;

/**
 * Generate Answer api utils class.
 *
 * @remarks
 * This class is helper class for generate answer api, which is used to make queries to a single QnA Maker knowledge base and return the result.
 */
export class ActiveLearningUtils {
	
    /**
    * Returns list of qnaSearch results which have low score variation.
    * @param {QnAMakerResult[]} qnaSearchResults A list of results returned from the QnA getAnswer call.
    */
    public static getLowScoreVariation(qnaSearchResults: QnAMakerResult[]){
        
        if (qnaSearchResults == null || qnaSearchResults.length == 0){
            return [];
        }

        if(qnaSearchResults.length == 1){
            return qnaSearchResults;
        }

        var filteredQnaSearchResult = [];
        var topAnswerScore = qnaSearchResults[0].score * 100;
        var prevScore = topAnswerScore;

        if((topAnswerScore > MinimumScoreForLowScoreVariation) && (topAnswerScore <= MaximumScoreForLowScoreVariation)){
            filteredQnaSearchResult.push(qnaSearchResults[0]);

            for(var i = 1; i < qnaSearchResults.length; i++){
                if (ActiveLearningUtils.includeForClustering(prevScore, qnaSearchResults[i].score * 100, PreviousLowScoreVariationMultiplier) && this.includeForClustering(topAnswerScore, qnaSearchResults[i].score * 100, MaxLowScoreVariationMultiplier)){
                    prevScore = qnaSearchResults[i].score * 100;
                    filteredQnaSearchResult.push(qnaSearchResults[i]);
                }
            }
        }

        return filteredQnaSearchResult;
    }


    private static includeForClustering(prevScore, currentScore, multiplier)
    {
        return (prevScore - currentScore) < (multiplier * Math.sqrt(prevScore));
    }
}
