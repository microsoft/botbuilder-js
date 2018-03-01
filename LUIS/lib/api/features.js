const {ServiceBase} = require('./serviceBase');

class Features extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/features');
    }

    /**
     * Gets all application version features.
     */
    async getVersionFeatures() {
        return this.createRequest('get', ['skip', 'take']);
    }

}

module.exports = {Features};
