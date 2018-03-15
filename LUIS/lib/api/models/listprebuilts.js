const {ServiceBase} = require('../serviceBase');

class Listprebuilts extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/listprebuilts');
    }

    /**
     * Gets all the available prebuilt entities for the application based on the application's culture.
     */
    getAvailablePrebuiltEntityList(params) {
        return this.createRequest('', params, 'get');
    }
}

module.exports = Listprebuilts;
