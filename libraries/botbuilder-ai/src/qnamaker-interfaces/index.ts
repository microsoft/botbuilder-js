/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

export { AnswerSpanResponse } from './answerspanResponse';
export { FeedbackRecord } from './feedbackRecord';
export { FeedbackRecords } from './feedbackRecords';
export { Filters } from './filters';
export { JoinOperator } from './joinOperator';
export { KnowledgeBaseAnswer } from './knowledgeBaseAnswer';
export { KnowledgeBaseAnswers } from './knowledgeBaseAnswers';
export { KnowledgeBaseAnswerSpan } from './knowledgeBaseAnswerSpan';
export { MetadataFilter } from './metadataFilter';
export { QnAMakerEndpoint } from './qnamakerEndpoint';
export { QnAMakerMetadata } from './qnamakerMetadata';
export { QnAMakerOptions } from './qnamakerOptions';
// The QnAMakerResult and QnAMakerResults interfaces should be named QueryResult and QueryResults as in Microsoft.Bot.Builder.AI.QnA
// https://github.com/microsoft/botbuilder-dotnet/tree/a8acd75d79a7d8c4f0ad248e727bb2da3982e416/libraries/Microsoft.Bot.Builder.AI.QnA/Models
// They cannot be renamed without breaking changes.
export { QnAMakerPrompt } from './qnamakerPrompt';
export { QnAMakerResult } from './qnamakerResult';
export { QnAMakerResults } from './qnamakerResults';
export { QnAMakerTraceInfo } from './qnamakerTraceInfo';
export { QnARequestContext } from './qnaRequestContext';
export { QnAResponseContext } from './qnaResponseContext';
export { RankerTypes } from './rankerTypes';
export { ServiceType } from './serviceType';
