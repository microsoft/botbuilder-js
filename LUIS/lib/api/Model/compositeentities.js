const {ServiceBase} = require('../serviceBase');
class Compositeentities extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/compositeentities');
    }

    /**
    * Gets information about the composite entity models.
    */
    ListCompositeEntities(params) {
        return this.createRequest('', params, 'get');
    }
    /**
    * Adds a composite entity extractor to the application.
    */
    AddCompositeEntity(params , compositeModelCreateObject/* CompositeEntityModel */) {
        return this.createRequest('', params, 'post', compositeModelCreateObject);
    }
    /**
    * Deletes a composite entity extractor from the application.
    */
    DeleteCompositeEntity(params) {
        return this.createRequest('/{cEntityId}', params, 'delete');
    }
    /**
    * Updates the composite entity extractor.
    */
    UpdateCompositeEntity(params , compositeModelUpdateObject/* CompositeEntityModel */) {
        return this.createRequest('/{cEntityId}', params, 'put', compositeModelUpdateObject);
    }
    /**
    * Gets information about the composite entity model.
    */
    GetCompositeEntity(params) {
        return this.createRequest('/{cEntityId}', params, 'get');
    }
    /**
    * Creates a single child in an existing composite entity model.
    */
    AddCompositeEntityChild(params , compositeChildModelCreateObject) {
        return this.createRequest('/{cEntityId}/children', params, 'post', compositeChildModelCreateObject);
    }
    /**
    * Deletes a composite entity extractor child from the application.
    */
    DeleteCompositeEntityChild(params) {
        return this.createRequest('/{cEntityId}/children/{cChildId}', params, 'delete');
    }
    /**
    * undefined
    */
    CreateCompositeEntityRole(params , entityRoleCreateObject/* EntityRoleCreateObject */) {
        return this.createRequest('/{cEntityId}/roles', params, 'post', entityRoleCreateObject);
    }
    /**
    * undefined
    */
    GetCompositeEntityRoles(params) {
        return this.createRequest('/{cEntityId}/roles', params, 'get');
    }
    /**
    * undefined
    */
    DeleteCompositeEntityRole(params) {
        return this.createRequest('/{cEntityId}/roles/{roleId}', params, 'delete');
    }
    /**
    * undefined
    */
    UpdateCompositeEntityRole(params , entityRoleUpdateObject/* EntityRoleUpdateObject */) {
        return this.createRequest('/{cEntityId}/roles/{roleId}', params, 'put', entityRoleUpdateObject);
    }
    /**
    * undefined
    */
    GetCompositeEntityRole(params) {
        return this.createRequest('/{cEntityId}/roles/{roleId}', params, 'get');
    }
}
module.exports = Compositeentities;
