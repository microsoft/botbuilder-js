const {ServiceBase} = require('../serviceBase');

class Customprebuiltentities extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/customprebuiltentities');
    }

    /**
     * Gets all custom prebuilt entities information of this application
     */
    getCustomPrebuiltDomainEntitiesList(params) {
        return this.createRequest('', params, 'get');
    }

    /**
     * Adds a custom prebuilt entity model to the application
     */
    addCustomPrebuiltEntity(params, prebuiltDomainModelCreateObject/* PrebuiltDomainModelCreateObject */) {
        return this.createRequest('', params, 'post', prebuiltDomainModelCreateObject);
    }
}

module.exports = Customprebuiltentities;
