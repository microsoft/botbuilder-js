/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { ServiceType } from './serviceType';

/**
 * Defines an endpoint used to connect to a QnA Maker Knowledge base.
 */
export interface QnAMakerEndpoint {
    /**
     * ID of your knowledge base. For example: `98185f59-3b6f-4d23-8ebb-XXXXXXXXXXXX`
     */
    knowledgeBaseId: string;

    /**
     * Your endpoint key. For `v2` or `v3` knowledge bases this is your subscription key.
     * For example: `4cb65a02697745eca369XXXXXXXXXXXX`
     */
    endpointKey: string;

    /**
     * The host path. For example: `https://testqnamaker.azurewebsites.net/qnamaker`
     */
    host: string;

    /**
     * QnA service type '' - qnamaker, language
     */
    qnaServiceType?: ServiceType;
}
