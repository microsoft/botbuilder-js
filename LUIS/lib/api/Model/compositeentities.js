/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
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
    * Create an entity role for an entity in the application.
    */
    CreateCompositeEntityRole(params , entityRoleCreateObject/* EntityRoleCreateObject */) {
        return this.createRequest('/{cEntityId}/roles', params, 'post', entityRoleCreateObject);
    }
    /**
    * Get All Entity Roles for a given entity
    */
    GetCompositeEntityRoles(params) {
        return this.createRequest('/{cEntityId}/roles', params, 'get');
    }
    /**
    * Delete an entity role.
    */
    DeleteCompositeEntityRole(params) {
        return this.createRequest('/{cEntityId}/roles/{roleId}', params, 'delete');
    }
    /**
    * Update an entity role for a given entity
    */
    UpdateCompositeEntityRole(params , entityRoleUpdateObject/* EntityRoleUpdateObject */) {
        return this.createRequest('/{cEntityId}/roles/{roleId}', params, 'put', entityRoleUpdateObject);
    }
    /**
    * Get one entity role for a given entity
    */
    GetCompositeEntityRole(params) {
        return this.createRequest('/{cEntityId}/roles/{roleId}', params, 'get');
    }
}
module.exports = Compositeentities;
