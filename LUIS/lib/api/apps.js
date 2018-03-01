const {ServiceBase} = require('./serviceBase');

class Apps extends ServiceBase {
    constructor() {
        super('/apps/');
    }

    /**
     * Lists all of the user applications.
     */
    async getApplicationsList() {
        return this.createRequest('get', ['skip', 'take']);
    }

    /**
     * Creates a new LUIS app.
     */
    async addApplication(applicationCreateObject/* ApplicationCreateObject */) {
        return this.createRequest('post', [], applicationCreateObject);
    }

    /**
     * Deletes an application.
     */
    async deleteApplication() {
        return this.createRequest('delete', []);
    }

    /**
     * Updates the name or description of the application.
     */
    async renameApplication(applicationUpdateObject/* ApplicationUpdateObject */) {
        return this.createRequest('put', [], applicationUpdateObject);
    }

    /**
     * Gets the application info.
     */
    async getApplicationInfo() {
        return this.createRequest('get', []);
    }

}

module.exports = {Apps};
