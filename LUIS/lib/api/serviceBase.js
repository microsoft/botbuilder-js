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
            throw new Error(`The required param "${param}" is missing.`);
        }
    });
};
module.exports = {ServiceBase};
