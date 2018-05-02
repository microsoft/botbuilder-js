const {ServiceBase} = require('../serviceBase');
class Listprebuilts extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/listprebuilts');
    }

    /**
    * Gets all the available prebuilt entity extractors for the application.
    */
    ListPrebuiltEntities(params) {
        return this.createRequest('', params, 'get');
    }
}
module.exports = Listprebuilts;
