const {insertParametersFromObject} = require('../utils/insertParametersFromObject');

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

    createRequest(method, dataModel) {
        const {commonHeaders: headers, config, endpoint} = this;
        const {base, baseParams, operations} = config;
        if (!operations.includes(method)) {
            throw new Error(`${method} is not implemented for them ${endpoint} endpoint`);
        }
        const params = Object.assign({}, baseParams, dataModel);
        const URL = insertParametersFromObject(base + endpoint, params);
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

module.exports = {ServiceBase};
