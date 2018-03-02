const {ServiceBase} = require('./serviceBase');

class Export extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/export');
    }

    /**
     * Exports a LUIS application to JSON format.
     */
    async exportApplicationVersion(params) {
        return this.createRequest('', params, 'get');
    }
}

module.exports = {Export};
