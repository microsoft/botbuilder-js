const {ServiceBase} = require('./serviceBase');

class Import extends ServiceBase {
    constructor() {
        super('/apps/import');
    }

    /**
     * Imports an application to LUIS, the application's JSON should be included in the request body. Returns new app ID.
     */
    async importApplication(params, jSONApp/* JSONApp */) {
        return this.createRequest('', params, 'post', jSONApp);
    }
}

module.exports = {Import};
