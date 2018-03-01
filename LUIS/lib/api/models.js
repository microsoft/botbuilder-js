const {ServiceBase} = require('./serviceBase');

class Models extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/models');
    }

    /**
     * Gets information about the application version models.
     */
    async getVersionModelList() {
        return this.createRequest('get', ['skip', 'take']);
    }

}

module.exports = {Models};
