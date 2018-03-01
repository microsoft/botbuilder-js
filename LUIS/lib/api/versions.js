const {ServiceBase} = require('./serviceBase');

class Versions extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions');
    }

    /**
     * Gets the application versions info.
     */
    async getApplicationVersionList() {
        return this.createRequest('get', ['skip', 'take']);
    }

    /**
     * Deletes an application version.
     */
    async deleteApplicationVersion() {
        return this.createRequest('delete', []);
    }

    /**
     * Updates the name or description of the application version.
     */
    async renameApplicationVersion(taskUpdateObject/* TaskUpdateObject */) {
        return this.createRequest('put', [], taskUpdateObject);
    }

    /**
     * Gets the task info.
     */
    async getApplicationVersion() {
        return this.createRequest('get', []);
    }

    /**
     * Imports a new version into a LUIS application, the version's JSON should be included in in the request body.
     */
    async importVersionToApplication(jSONApp/* JSONApp */) {
        return this.createRequest('post', ['versionId'], jSONApp);
    }

}

module.exports = {Versions};
