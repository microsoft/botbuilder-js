/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { QnAMakerMetadata } from './qnamakerMetadata';

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

    /**
     * (Optional) Filters used on query.
     */
    strictFilters?: QnAMakerMetadata[];

    /**
     * (Optional) Metadata related to query.
     */
    metadataBoost?: QnAMakerMetadata[];

    /** (Optional) The time in milliseconds to wait before the request times out.
     * 
     * @remarks Defaults to "100000" milliseconds.
    */
   timeout?: number;
}