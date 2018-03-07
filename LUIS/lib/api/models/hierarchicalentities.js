const {ServiceBase} = require('../serviceBase');

class Hierarchicalentities extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/hierarchicalentities');
    }

    /**
     * Gets information about the hierarchical entity models.
     */
    async getVersionHierarchicalEntityList(params) {
        return this.createRequest('', params, 'get');
    }

    /**
     * Adds a hierarchical entity extractor to the application version.
     */
    async createHierarchicalEntity(params, hierarchicalModelCreateObject/* HierarchicalModelCreateObject */) {
        return this.createRequest('', params, 'post', hierarchicalModelCreateObject);
    }

    /**
     * Deletes a hierarchical entity extractor from the application version.
     */
    async deleteHierarchicalEntity(params) {
        return this.createRequest('/{hEntityId}', params, 'delete');
    }

    /**
     * Updates the name and children of a hierarchical entity model.
     */
    async updateHierarchicalEntity(params, hierarchicalModelUpdateObject/* HierarchicalModelUpdateObject */) {
        return this.createRequest('/{hEntityId}', params, 'put', hierarchicalModelUpdateObject);
    }

    /**
     * Gets information about the hierarchical entity model.
     */
    async getHierarchicalEntity(params) {
        return this.createRequest('/{hEntityId}', params, 'get');
    }

    /**
     * Creates a single child in an existing hierarchical entity model.
     */
    async createHierarchicalChildEntity(params, body) {
        return this.createRequest('/{hEntityId}/children', params, 'post', body);
    }

    /**
     * Deletes a hierarchical entity extractor child from the application.
     */
    async deleteHierarchicalChildEntity(params) {
        return this.createRequest('/{hEntityId}/children/{hChildId}', params, 'delete');
    }

    /**
     * Renames a single child in an existing hierarchical entity model.
     */
    async updateHierarchicalChildEntity(params, body) {
        return this.createRequest('/{hEntityId}/children/{hChildId}', params, 'put', body);
    }

    /**
     * Gets information about the hierarchical entity child model.
     */
    async getHierarchicalChildEntity(params) {
        return this.createRequest('/{hEntityId}/children/{hChildId}', params, 'get');
    }
}

module.exports = Hierarchicalentities;
