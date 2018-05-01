const {ServiceBase} = require('../serviceBase');
class Models extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/models');
    }

    /**
    * Gets information about the application version models.
    */
    ListModels(params) {
        return this.createRequest('', params, 'get');
    }
}
module.exports = Models;
