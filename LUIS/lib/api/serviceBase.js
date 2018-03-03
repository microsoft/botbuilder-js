const {insertParametersFromObject} = require('../utils/insertParametersFromObject');
const deriveParamsFromPath = require('../utils/deriveParamsFromPath');

class ServiceBase {

    /**
     * @property {string} endpoint The endpoint for this service
     */

    /**
     * @property {object} config The configuration object for this app
     */

    /**
     *
     * @param endpoint
     */
    constructor(endpoint) {
        this.endpoint = endpoint;
    }

    createRequest(pathFragment, params, method, dataModel) {
        const {commonHeaders: headers, config, endpoint} = this;
        const {endpointBasePath, appId, versionId} = config;
        const tokenizedUrl = endpointBasePath + endpoint + pathFragment;

        params = Object.assign((dataModel || {}), params, {appId, versionId});
        ServiceBase.validateParams(tokenizedUrl, params);

        const URL = insertParametersFromObject(tokenizedUrl, params);
        const body = dataModel ? JSON.stringify(dataModel) : undefined;

        return fetch(URL, {headers, method, body});
    }

    get commonHeaders() {
        return {
            'Content-Type': 'application/json',
            'Ocp-Apim-Subscription-Key': this.config.subscriptionKey
        };
    }
}

ServiceBase.validateParams = function (tokenizedUrl, params) {
    const paramsFromPath = deriveParamsFromPath(tokenizedUrl);

    paramsFromPath.forEach(param => {
        if (!(param in params)) {
            throw new Error(`${param} is missing.`);
        }
    });
};
module.exports = {ServiceBase};
