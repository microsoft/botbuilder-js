const {ServiceBase} = require('./serviceBase');

class Export extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/export');
    }

    /**
     * Exports a LUIS application to JSON format.
     */
    async exportApplicationVersion() {
        return this.createRequest('get', []);
    }

}

module.exports = {Export};
