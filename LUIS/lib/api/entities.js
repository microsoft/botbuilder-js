const {ServiceBase} = require('./serviceBase');

class Entities extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/entities');
    }

    /**
     * Gets information about the entity models.
     */
    async getVersionEntityList() {
        return this.createRequest('get', ['skip', 'take']);
    }

    /**
     * Adds an entity extractor to the application.
     */
    async createEntity(modelCreateObject/* ModelCreateObject */) {
        return this.createRequest('post', [], modelCreateObject);
    }

    /**
     * Deletes an entity extractor from the application.
     */
    async deleteEntity() {
        return this.createRequest('delete', []);
    }

    /**
     * Updates the name of an entity extractor.
     */
    async renameEntity(modelUpdateObject/* ModelUpdateObject */) {
        return this.createRequest('put', [], modelUpdateObject);
    }

    /**
     * Gets information about the entity model.
     */
    async getEntity() {
        return this.createRequest('get', []);
    }

    /**
     * Suggests examples that would improve the accuracy of the entity model.
     */
    async suggestEndpointQueriesForEntities() {
        return this.createRequest('get', ['take']);
    }

}

module.exports = {Entities};
