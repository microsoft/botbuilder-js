/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Prompt } from './prompt';

 /**
 * The context associated with QnA.  Used to mark if the qna response has related prompts.
 */
export interface QnAResponseContext {
    
    /**
     * The prompts collection of related prompts.
     */
    prompts: Prompt[];
}