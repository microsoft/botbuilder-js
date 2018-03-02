const {ServiceBase} = require('./serviceBase');

class Entities extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/entities');
    }

    /**
     * Gets information about the entity models.
     */
    async getVersionEntityList(params) {
        return this.createRequest('', params, 'get');
    }

    /**
     * Adds an entity extractor to the application.
     */
    async createEntity(params, modelCreateObject/* ModelCreateObject */) {
        return this.createRequest('', params, 'post', modelCreateObject);
    }

    /**
     * Deletes an entity extractor from the application.
     */
    async deleteEntity(params) {
        return this.createRequest('/{entityId}', params, 'delete');
    }

    /**
     * Updates the name of an entity extractor.
     */
    async renameEntity(params, modelUpdateObject/* ModelUpdateObject */) {
        return this.createRequest('/{entityId}', params, 'put', modelUpdateObject);
    }

    /**
     * Gets information about the entity model.
     */
    async getEntity(params) {
        return this.createRequest('/{entityId}', params, 'get');
    }

    /**
     * Suggests examples that would improve the accuracy of the entity model.
     */
    async suggestEndpointQueriesForEntities(params) {
        return this.createRequest('/{entityId}/suggest', params, 'get');
    }
}

module.exports = {Entities};
