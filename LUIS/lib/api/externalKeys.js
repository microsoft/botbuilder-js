const {ServiceBase} = require('./serviceBase');

class ExternalKeys extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/externalKeys');
    }

    /**
     * Gets the given application versions's external keys.
     */
    async getApplicationVersionExternalApiKeys(params) {
        return this.createRequest('', params, 'get');
    }

    /**
     * Assigns an external API key to the given application according to the specified key type.
     */
    async updateApplicationVersionExternalKey(params, externalKeyUpdateObject/* ExternalKeyUpdateObject */) {
        return this.createRequest('', params, 'put', externalKeyUpdateObject);
    }
}

module.exports = {ExternalKeys};
