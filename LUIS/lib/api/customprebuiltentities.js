const {ServiceBase} = require('./serviceBase');

class Customprebuiltentities extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/customprebuiltentities');
    }

    /**
     * Gets all custom prebuilt entities information of this application
     */
    async getCustomPrebuiltDomainEntitiesList() {
        return this.createRequest('get', []);
    }

    /**
     * Adds a custom prebuilt entity model to the application
     */
    async addCustomPrebuiltEntity(prebuiltDomainModelCreateObject/* PrebuiltDomainModelCreateObject */) {
        return this.createRequest('post', [], prebuiltDomainModelCreateObject);
    }

}

module.exports = {Customprebuiltentities};
