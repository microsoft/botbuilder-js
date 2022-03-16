/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { JoinOperator } from './joinOperator';
import { QnAMakerMetadata } from './qnamakerMetadata';
import { QnARequestContext } from './qnaRequestContext';
import { Filters } from './filters';

/**
 * Additional settings used to configure a `QnAMaker` instance.
 */
export interface QnAMakerOptions {
    /**
     * (Optional) The minimum score threshold, used to filter returned results. Values range from score of 0.0 to 1.0.
     *
     * @summary
     * Defaults to "0.3".
     */
    scoreThreshold?: number;

    /**
     * (Optional) number of results to return.
     *
     * @summary
     * Defaults to "1".
     */
    top?: number;

    /**
     * (Optional) Filters used on query.
     */
    strictFilters?: QnAMakerMetadata[];

    filters?: Filters;
    /**
     * (Optional) Metadata related to query.
     */
    metadataBoost?: QnAMakerMetadata[];

    /**
     * (Optional) The time in milliseconds to wait before the request times out.
     *
     * @summary Defaults to "100000" milliseconds.
     */
    timeout?: number;

    /**
     * The context of the previous turn.
     */
    context?: QnARequestContext;

    /**
     * Id of the current question asked.
     */
    qnaId?: number;

    /**
     * A value indicating whether to call test or prod environment of knowledgebase.
     */
    isTest?: boolean;

    /**
     * Ranker types.
     */
    rankerType?: string;

    /**
     * A value indicating choice for Strict Filters Join Operation.
     */
    strictFiltersJoinOperator?: JoinOperator;

    /**
     * A value indicating user's choice to receive PreciseAnswer or not.
     */
    enablePreciseAnswer?: boolean;

    /**
     * includeUnstructuredSources - option to fetch answers from unsrtuctured sources
     */
    includeUnstructuredSources?: boolean;
}
