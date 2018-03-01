const {ServiceBase} = require('./serviceBase');

class Import extends ServiceBase {
    constructor() {
        super('/apps/import');
    }

    /**
     * Imports an application to LUIS, the application's JSON should be included in the request body. Returns new app ID.
     */
    async importApplication(jSONApp/* JSONApp */) {
        return this.createRequest('post', ['appName'], jSONApp);
    }

}

module.exports = {Import};
