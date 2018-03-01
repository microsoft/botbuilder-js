const {ServiceBase} = require('./serviceBase');

class ExternalKeys extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/externalKeys');
    }

    /**
     * Gets the given application versions's external keys.
     */
    async getApplicationVersionExternalApiKeys() {
        return this.createRequest('get', []);
    }

    /**
     * Assigns an external API key to the given application according to the specified key type.
     */
    async updateApplicationVersionExternalKey(externalKeyUpdateObject/* ExternalKeyUpdateObject */) {
        return this.createRequest('put', [], externalKeyUpdateObject);
    }

}

module.exports = {ExternalKeys};
