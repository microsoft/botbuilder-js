const {ServiceBase} = require('../serviceBase');

class Apps extends ServiceBase {
    constructor() {
        super('/apps/');
    }

    /**
     * Lists all of the user applications.
     */
    getApplicationsList(params) {
        return this.createRequest('/', params, 'get');
    }

    /**
     * Creates a new LUIS app.
     */
    addApplication(params, applicationCreateObject/* ApplicationCreateObject */) {
        return this.createRequest('/', params, 'post', applicationCreateObject);
    }

    /**
     * Deletes an application.
     */
    deleteApplication(params) {
        return this.createRequest('/{appId}', params, 'delete');
    }

    /**
     * Updates the name or description of the application.
     */
    renameApplication(params, applicationUpdateObject/* ApplicationUpdateObject */) {
        return this.createRequest('/{appId}', params, 'put', applicationUpdateObject);
    }

    /**
     * Gets the application info.
     */
    getApplicationInfo(params) {
        return this.createRequest('/{appId}', params, 'get');
    }
}

module.exports = Apps;
