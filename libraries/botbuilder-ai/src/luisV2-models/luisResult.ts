/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import { Sentiment } from './luisModels';
import { HttpOperationResponse as HttpResponse, RequestOptionsBase } from 'botbuilder-stdlib/lib/azureCoreHttpCompat';

/**
 * Prediction, based on the input query, containing intent(s) and entities.
 */
export interface LuisResult {
    /**
     * The input utterance that was analyzed.
     */
    query?: string;
    /**
     * The corrected utterance (when spell checking was enabled).
     */
    alteredQuery?: string;
    /**
     * The intent with the higher score.
     */
    topScoringIntent?: IntentModel;
    /**
     * All the intents (and their score) that were detected from utterance.
     */
    intents?: IntentModel[];
    /**
     * The entities extracted from the utterance.
     */
    entities?: EntityModel[];
    /**
     * The composite entities extracted from the utterance.
     */
    compositeEntities?: CompositeEntityModel[];
    /**
     * Sentiment of the input utterance.
     */
    sentimentAnalysis?: Sentiment;
    /**
     * Prediction, based on the input query, containing intents and entities.
     */
    connectedServiceResult?: LuisResult;
}

/**
 * An intent detected from the utterance.
 */
export interface IntentModel {
    /**
     * Name of the intent, as defined in LUIS.
     */
    intent?: string;
    /**
     * Associated prediction score for the intent (float).
     */
    score?: number;
}

/**
 * An entity extracted from the utterance.
 */
export interface EntityModel {
    /**
     * Name of the entity, as defined in LUIS.
     */
    entity: string;
    /**
     * Type of the entity, as defined in LUIS.
     */
    type: string;
    /**
     * The position of the first character of the matched entity within the utterance.
     */
    startIndex: number;
    /**
     * The position of the last character of the matched entity within the utterance.
     */
    endIndex: number;
    /**
     * Describes unknown properties. The value of an unknown property can be of "any" type.
     */
    [property: string]: any;
}

/**
 * LUIS Composite Entity.
 */
export interface CompositeEntityModel {
    /**
     * Type/name of parent entity.
     */
    parentType: string;
    /**
     * Value for composite entity extracted by LUIS.
     */
    value: string;
    /**
     * Child entities.
     */
    children: CompositeChildModel[];
}

/**
 * Child entity in a LUIS Composite Entity.
 */
export interface CompositeChildModel {
    /**
     * Type of child entity.
     */
    type: string;
    /**
     * Value extracted by LUIS.
     */
    value: string;
}

/**
 * Optional Parameters.
 */
export interface PredictionResolveOptionalParams extends RequestOptionsBase {
    /**
     * The timezone offset for the location of the request.
     */
    timezoneOffset?: number;
    /**
     * If true, return all intents instead of just the top scoring intent.
     */
    verbose?: boolean;
    /**
     * Use the staging endpoint slot.
     */
    staging?: boolean;
    /**
     * Enable spell checking.
     */
    spellCheck?: boolean;
    /**
     * The subscription key to use when enabling bing spell check
     */
    bingSpellCheckSubscriptionKey?: string;
    /**
     * Log query (default is true)
     */
    log?: boolean;
}

/**
 * Contains response data for the resolve operation.
 */
export type PredictionResolveResponse = LuisResult & {
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
        parsedBody: LuisResult;
    };
};
