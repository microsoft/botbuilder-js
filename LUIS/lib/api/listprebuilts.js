const {ServiceBase} = require('./serviceBase');

class Listprebuilts extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/listprebuilts');
    }

    /**
     * Gets all the available prebuilt entities for the application based on the application's culture.
     */
    async getAvailablePrebuiltEntityList() {
        return this.createRequest('get', []);
    }

}

module.exports = {Listprebuilts};
