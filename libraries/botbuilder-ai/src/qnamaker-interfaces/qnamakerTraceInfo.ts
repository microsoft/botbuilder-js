/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Activity } from 'botbuilder-core';
import { QnAMakerResult } from './qnamakerResult';
import { QnARequestContext } from './qnaRequestContext';

/**
 * Trace info that we collect and emit from a QnA Maker query
 */
export interface QnAMakerTraceInfo {
    /**
     * Message which instigated the query to QnA Maker.
     */
    message: Activity;

    /**
     * Results that QnA Maker returned.
     */
    queryResults: QnAMakerResult[];

    /**
     * ID of the knowledge base that is being queried.
     */
    knowledgeBaseId: string;

    /**
     * The minimum score threshold, used to filter returned results.
     */
    scoreThreshold: number;

    /**
     * Number of ranked results that are asked to be returned.
     */
    top: number;

    /**
     * Filters used on query. Not used in JavaScript SDK v4 yet.
     */
    strictFilters: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any

    /**
     * Metadata related to query. Not used in JavaScript SDK v4 yet.
     */
    metadataBoost: any[]; // eslint-disable-line @typescript-eslint/no-explicit-any

    /**
     * The context for multi-turn responses.
     */
    context?: QnARequestContext;

    /**
     * Id of the current question asked.
     */
    qnaId?: number;
}
