const {ServiceBase} = require('./serviceBase');

class Compositeentities extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/compositeentities');
    }

    /**
     * Gets information about the composite entity models.
     */
    async getVersionCompositeEntityList() {
        return this.createRequest('get', ['skip', 'take']);
    }

    /**
     * Adds a composite entity extractor to the application.
     */
    async createCompositeEntity(hierarchicalModelCreateObject/* HierarchicalModelCreateObject */) {
        return this.createRequest('post', [], hierarchicalModelCreateObject);
    }

    /**
     * Deletes a composite entity extractor from the application.
     */
    async deleteCompositeEntity() {
        return this.createRequest('delete', []);
    }

    /**
     * Updates the composite entity extractor.
     */
    async updateCompositeEntity(hierarchicalModelUpdateObject/* HierarchicalModelUpdateObject */) {
        return this.createRequest('put', [], hierarchicalModelUpdateObject);
    }

    /**
     * Gets information about the composite entity model.
     */
    async getCompositeEntity() {
        return this.createRequest('get', []);
    }

    /**
     * Creates a single child in an existing composite entity model.
     */
    async createCompositeChildEntity(body) {
        return this.createRequest('post', [], body);
    }

    /**
     * Deletes a composite entity extractor child from the application.
     */
    async deleteCompositeChildEntity() {
        return this.createRequest('delete', []);
    }

}

module.exports = {Compositeentities};
