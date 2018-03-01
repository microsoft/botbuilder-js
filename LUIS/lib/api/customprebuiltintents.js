const {ServiceBase} = require('./serviceBase');

class Customprebuiltintents extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/customprebuiltintents');
    }

    /**
     * Gets custom prebuilt intents information of this application
     */
    async getCustomPrebuiltDomainIntentsList() {
        return this.createRequest('get', []);
    }

    /**
     * Adds a custom prebuilt intent model to the application
     */
    async addCustomPrebuiltIntent(prebuiltDomainModelCreateObject/* PrebuiltDomainModelCreateObject */) {
        return this.createRequest('post', [], prebuiltDomainModelCreateObject);
    }

}

module.exports = {Customprebuiltintents};
