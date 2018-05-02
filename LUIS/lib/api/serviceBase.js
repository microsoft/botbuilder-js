/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {insertParametersFromObject} = require('../utils/insertParametersFromObject');
const deriveParamsFromPath = require('../utils/deriveParamsFromPath');

/**
 * Base class for all services
 */
class ServiceBase {

    /**
     * @property {string} endpoint The endpoint for this service
     */

    /**
     *
     * @param {String} endpoint the endpoint for this service
     */
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    /**
     * Creates a request to the specified endpoint and returns
     * a promise.
     *
     * @param {string} pathFragment An additional fragment to append to the endpoint
     * @param {*} params An object containing the named params to be used to hydrate the tokenized url
     * @param {'get'|'post'|'put'|'PATCH'|'delete'} method The method for the request
     * @param {*} dataModel The data model to pass in as the request body
     * @returns {Promise<Response>} The promise representing the request
     */
    createRequest(pathFragment, params, method, dataModel = null) {
        const {commonHeaders: headers, endpoint} = this;
        const {endpointBasePath, appId, versionId} = ServiceBase.config;
        const tokenizedUrl = endpointBasePath + endpoint + pathFragment;
        // Order is important since we want to allow the user to
        // override their config with the data in the params object.
        params = Object.assign({}, (dataModel || {}), {appId, versionId}, params);
        ServiceBase.validateParams(tokenizedUrl, params);

        let URL = insertParametersFromObject(tokenizedUrl, params);
        if (method === 'get' && ('skip' in params || 'take' in params)) {
            const {skip, take} = params;
            URL += '?';
            if (!isNaN(+skip)) {
                URL += `skip=${~~skip}`;
            }
            if (!isNaN(+take)) {
                URL += !isNaN(+skip) ? `&take=${~~take}` : `take=${~~take}`;
            }
        }
        const body = dataModel ? JSON.stringify(dataModel) : undefined;
        if (params.debug) {
            console.log(`${method.toUpperCase()} ${URL}`);
            if (headers)
                console.log(`HEADERS:${JSON.stringify(headers)}`);
            if (body)
                console.log(body);
        }

        return fetch(URL, {headers, method, body});
    }

    /**
     * Headers that are common to all requests
     *
     * @returns {{'Content-Type': string, 'Ocp-Apim-Subscription-Key': string}}
     */
    get commonHeaders() {
        return {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': ServiceBase.config.authoringKey
        };
    }
}

/**
 * Validates the params object and will throw if
 * a required param is missing.
 *
 * @param tokenizedUrl
 * @param params
 */
ServiceBase.validateParams = function (tokenizedUrl, params) {
    const paramsFromPath = deriveParamsFromPath(tokenizedUrl);

    paramsFromPath.forEach(param => {
        if (!params[param]) {
            const error = new Error(`The required param --${param} is missing.\n`);
            error.name = 'ArgumentError';
            throw error;
        }
    });
};
/**
 * @type {*} The configuration object containing
 * the endpointBasePath, appId, versionId and authoringKey properties.
 */
ServiceBase.config = {endpointBasePath: '', appId: '', versionId: '', authoringKey: ''};

module.exports = {ServiceBase};
