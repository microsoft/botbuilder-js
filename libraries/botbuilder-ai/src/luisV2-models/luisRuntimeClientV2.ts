/**
 * @module botbuilder-ai
 */
/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the MIT License.
 */

import * as msRest from '@azure/ms-rest-js';
import * as Models from './luisResult';
import * as Mappers from './luisMappers';
import { LuisPrediction } from './luisPrediction';
import { LUISRuntimeClientContext } from '@azure/cognitiveservices-luis-runtime';

/**
 * Represents the LUIS client for V2 of the runtime.
 *
 * @remarks This is a clone of the LUISRuntimeClient in version 2 of the runtime.
 */
class LUISRuntimeClientV2 extends LUISRuntimeClientContext {
    // Operation groups
    prediction: LuisPrediction;

    /**
     * Initializes a new instance of the LUISRuntimeClientV2 class.
     *
     * @param credentials Subscription credentials which uniquely identify client subscription.
     * @param endpoint Supported Cognitive Services endpoints (protocol and hostname, for example:
     * https://westus.api.cognitive.microsoft.com).
     * @param [options] The parameter options
     */
    constructor(credentials: msRest.ServiceClientCredentials, endpoint: string, options?: msRest.ServiceClientOptions) {
        super(credentials, endpoint, options);
        this.prediction = new LuisPrediction(this);
        super.baseUri = '{Endpoint}/luis/v2.0';
    }
}

// Operation Specifications

export { LUISRuntimeClientV2, Models as LUISRuntimeModels, Mappers as LUISRuntimeMappers };
