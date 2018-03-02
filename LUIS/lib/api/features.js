const {ServiceBase} = require('./serviceBase');

class Features extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/features');
    }

    /**
     * Gets all application version features.
     */
    async getVersionFeatures(params) {
        return this.createRequest('', params, 'get');
    }
}

module.exports = {Features};
