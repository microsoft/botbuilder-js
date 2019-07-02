/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { FeedbackRecord } from '../qnamaker-interfaces/feedbackRecord';

 /**
 * Defines array of active learning feedback records.
 */
export interface FeedbackRecords {
    
    /**
     * Array of feedback records.
     */
    feedbackRecords: FeedbackRecord[];
}