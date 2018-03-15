const {ServiceBase} = require('../serviceBase');

class Compositeentities extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/compositeentities');
    }

    /**
     * Gets information about the composite entity models.
     */
    getVersionCompositeEntityList(params) {
        return this.createRequest('', params, 'get');
    }

    /**
     * Adds a composite entity extractor to the application.
     */
    createCompositeEntity(params, hierarchicalModelCreateObject/* HierarchicalModelCreateObject */) {
        return this.createRequest('', params, 'post', hierarchicalModelCreateObject);
    }

    /**
     * Deletes a composite entity extractor from the application.
     */
    deleteCompositeEntity(params) {
        return this.createRequest('/{cEntityId}', params, 'delete');
    }

    /**
     * Updates the composite entity extractor.
     */
    updateCompositeEntity(params, hierarchicalModelUpdateObject/* HierarchicalModelUpdateObject */) {
        return this.createRequest('/{cEntityId}', params, 'put', hierarchicalModelUpdateObject);
    }

    /**
     * Gets information about the composite entity model.
     */
    getCompositeEntity(params) {
        return this.createRequest('/{cEntityId}', params, 'get');
    }

    /**
     * Creates a single child in an existing composite entity model.
     */
    createCompositeChildEntity(params, body) {
        return this.createRequest('/{cEntityId}/children', params, 'post', body);
    }

    /**
     * Deletes a composite entity extractor child from the application.
     */
    deleteCompositeChildEntity(params) {
        return this.createRequest('/{cEntityId}/children/{cChildId}', params, 'delete');
    }
}

module.exports = Compositeentities;
