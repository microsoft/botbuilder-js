const {ServiceBase} = require('./serviceBase');

class Hierarchicalentities extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/hierarchicalentities');
    }

    /**
     * Gets information about the hierarchical entity models.
     */
    async getVersionHierarchicalEntityList() {
        return this.createRequest('get', ['skip', 'take']);
    }

    /**
     * Adds a hierarchical entity extractor to the application version.
     */
    async createHierarchicalEntity(hierarchicalModelCreateObject/* HierarchicalModelCreateObject */) {
        return this.createRequest('post', [], hierarchicalModelCreateObject);
    }

    /**
     * Deletes a hierarchical entity extractor from the application version.
     */
    async deleteHierarchicalEntity() {
        return this.createRequest('delete', []);
    }

    /**
     * Updates the name and children of a hierarchical entity model.
     */
    async updateHierarchicalEntity(hierarchicalModelUpdateObject/* HierarchicalModelUpdateObject */) {
        return this.createRequest('put', [], hierarchicalModelUpdateObject);
    }

    /**
     * Gets information about the hierarchical entity model.
     */
    async getHierarchicalEntity() {
        return this.createRequest('get', []);
    }

    /**
     * Deletes a hierarchical entity extractor child from the application.
     */
    async deleteHierarchicalChildEntity() {
        return this.createRequest('delete', []);
    }

    /**
     * Renames a single child in an existing hierarchical entity model.
     */
    async updateHierarchicalChildEntity(body) {
        return this.createRequest('put', [], body);
    }

    /**
     * Gets information about the hierarchical entity child model.
     */
    async getHierarchicalChildEntity() {
        return this.createRequest('get', []);
    }

    /**
     * Creates a single child in an existing hierarchical entity model.
     */
    async createHierarchicalChildEntity(body) {
        return this.createRequest('post', [], body);
    }

}

module.exports = {Hierarchicalentities};
