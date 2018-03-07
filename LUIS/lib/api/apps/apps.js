const {ServiceBase} = require('../serviceBase');

class Apps extends ServiceBase {
    constructor() {
        super('/apps/');
    }

    /**
     * Lists all of the user applications.
     */
    async getApplicationsList(params) {
        return this.createRequest('/', params, 'get');
    }

    /**
     * Creates a new LUIS app.
     */
    async addApplication(params, applicationCreateObject/* ApplicationCreateObject */) {
        return this.createRequest('/', params, 'post', applicationCreateObject);
    }

    /**
     * Deletes an application.
     */
    async deleteApplication(params) {
        return this.createRequest('/{appId}', params, 'delete');
    }

    /**
     * Updates the name or description of the application.
     */
    async renameApplication(params, applicationUpdateObject/* ApplicationUpdateObject */) {
        return this.createRequest('/{appId}', params, 'put', applicationUpdateObject);
    }

    /**
     * Gets the application info.
     */
    async getApplicationInfo(params) {
        return this.createRequest('/{appId}', params, 'get');
    }
}

module.exports = Apps;
