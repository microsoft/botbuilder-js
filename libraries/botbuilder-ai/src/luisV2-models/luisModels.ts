/*
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License. See License.txt in the project root for
 * license information.
 */

import { RequestOptionsBase, HttpOperationResponse as HttpResponse } from 'botbuilder-stdlib/lib/azureCoreHttpCompat';

/**
 * Represents an intent prediction.
 */
export interface Intent {
    /**
     * The score of the fired intent.
     */
    score?: number;
    /**
     * The prediction of the dispatched application.
     */
    childApp?: Prediction;
}

/**
 * The result of the sentiment analysis.
 */
export interface Sentiment {
    /**
     * The label of the sentiment analysis result.
     */
    label?: string;
    /**
     * The sentiment score of the query.
     */
    score: number;
}

/**
 * Represents the prediction of a query.
 */
export interface Prediction {
    /**
     * The query after pre-processing and normalization.
     */
    normalizedQuery: string;
    /**
     * The query after spell checking. Only set if spell check was enabled and a spelling mistake was
     * found.
     */
    alteredQuery?: string;
    /**
     * The name of the top scoring intent.
     */
    topIntent: string;
    /**
     * A dictionary representing the intents that fired.
     */
    intents: { [propertyName: string]: Intent };
    /**
     * The dictionary representing the entities that fired.
     */
    entities: { [propertyName: string]: any };
    /**
     * The result of the sentiment analysis.
     */
    sentiment?: Sentiment;
}

/**
 * Represents the prediction response.
 */
export interface PredictionResponse {
    /**
     * The query used in the prediction.
     */
    query: string;
    /**
     * The prediction of the requested query.
     */
    prediction: Prediction;
}

/**
 * Represents the definition of the error that occurred.
 */
export interface ErrorBody {
    /**
     * The error code.
     */
    code: string;
    /**
     * The error message.
     */
    message: string;
}

/**
 * Represents the error that occurred.
 */
export interface ErrorModel {
    error: ErrorBody;
}

/**
 * The custom options for the prediction request.
 */
export interface PredictionRequestOptions {
    /**
     * The reference DateTime used for predicting datetime entities.
     */
    datetimeReference?: Date;
    /**
     * Whether to make the external entities resolution override the predictions if an overlap
     * occurs.
     */
    overridePredictions?: boolean;
}

/**
 * Defines a user predicted entity that extends an already existing one.
 */
export interface ExternalEntity {
    /**
     * The name of the entity to extend.
     */
    entityName: string;
    /**
     * The start character index of the predicted entity.
     */
    startIndex: number;
    /**
     * The length of the predicted entity.
     */
    entityLength: number;
    /**
     * A user supplied custom resolution to return as the entity's prediction.
     */
    resolution?: any;
}

/**
 * Defines a sub-list to append to an existing list entity.
 */
export interface RequestList {
    /**
     * The name of the sub-list.
     */
    name?: string;
    /**
     * The canonical form of the sub-list.
     */
    canonicalForm: string;
    /**
     * The synonyms of the canonical form.
     */
    synonyms?: string[];
}

/**
 * Defines an extension for a list entity.
 */
export interface DynamicList {
    /**
     * The name of the list entity to extend.
     */
    listEntityName: string;
    /**
     * The lists to append on the extended list entity.
     */
    requestLists: RequestList[];
}

/**
 * Represents the prediction request parameters.
 */
export interface PredictionRequest {
    /**
     * The query to predict.
     */
    query: string;
    /**
     * The custom options defined for this request.
     */
    options?: PredictionRequestOptions;
    /**
     * The externally predicted entities for this request.
     */
    externalEntities?: ExternalEntity[];
    /**
     * The dynamically created list entities for this request.
     */
    dynamicLists?: DynamicList[];
}

/**
 * Optional Parameters.
 */
export interface PredictionGetVersionPredictionOptionalParams extends RequestOptionsBase {
    /**
     * Indicates whether to get extra metadata for the entities predictions or not.
     */
    verbose?: boolean;
    /**
     * Indicates whether to return all the intents in the response or just the top intent.
     */
    showAllIntents?: boolean;
    /**
     * Indicates whether to log the endpoint query or not.
     */
    log?: boolean;
}

/**
 * Optional Parameters.
 */
export interface PredictionGetSlotPredictionOptionalParams extends RequestOptionsBase {
    /**
     * Indicates whether to get extra metadata for the entities predictions or not.
     */
    verbose?: boolean;
    /**
     * Indicates whether to return all the intents in the response or just the top intent.
     */
    showAllIntents?: boolean;
    /**
     * Indicates whether to log the endpoint query or not.
     */
    log?: boolean;
}

/**
 * Contains response data for the getVersionPrediction operation.
 */
export type PredictionGetVersionPredictionResponse = PredictionResponse & {
    /**
     * The underlying HTTP response.
     */
    _response: HttpResponse & {
        /**
         * The response body as text (string format)
         */
        bodyAsText: string;

        /**
         * The response body as parsed JSON or XML
         */
        parsedBody: PredictionResponse;
    };
};

/**
 * Contains response data for the getSlotPrediction operation.
 */
export type PredictionGetSlotPredictionResponse = PredictionResponse & {
    /**
     * The underlying HTTP response.
     */
    _response: HttpResponse & {
        /**
         * The response body as text (string format)
         */
        bodyAsText: string;

        /**
         * The response body as parsed JSON or XML
         */
        parsedBody: PredictionResponse;
    };
};
