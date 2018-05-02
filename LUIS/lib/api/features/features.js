const {ServiceBase} = require('../serviceBase');
class Features extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/features');
    }

    /**
    * Gets all the extraction features for the specified application version.
    */
    List(params) {
        return this.createRequest('', params, 'get');
    }
}
module.exports = Features;
