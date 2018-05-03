/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('../serviceBase');
class Entities extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/entities');
    }

    /**
    * Gets information about the entity models.
    */
    ListEntities(params) {
        return this.createRequest('', params, 'get');
    }
    /**
    * Adds an entity extractor to the application.
    */
    AddEntity(params , modelCreateObject/* ModelCreateObject */) {
        return this.createRequest('', params, 'post', modelCreateObject);
    }
    /**
    * Deletes an entity extractor from the application.
    */
    DeleteEntity(params) {
        return this.createRequest('/{entityId}', params, 'delete');
    }
    /**
    * Updates the name of an entity extractor.
    */
    UpdateEntity(params , modelUpdateObject/* ModelUpdateObject */) {
        return this.createRequest('/{entityId}', params, 'put', modelUpdateObject);
    }
    /**
    * Gets information about the entity model.
    */
    GetEntity(params) {
        return this.createRequest('/{entityId}', params, 'get');
    }
    /**
    * Create an entity role for an entity in the application.
    */
    CreateEntityRole(params , entityRoleCreateObject/* EntityRoleCreateObject */) {
        return this.createRequest('/{entityId}/roles', params, 'post', entityRoleCreateObject);
    }
    /**
    * Get All Entity Roles for a given entity
    */
    GetEntityRoles(params) {
        return this.createRequest('/{entityId}/roles', params, 'get');
    }
    /**
    * Delete an entity role.
    */
    DeleteEntityRole(params) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'delete');
    }
    /**
    * Update an entity role for a given entity
    */
    UpdateEntityRole(params , entityRoleUpdateObject/* EntityRoleUpdateObject */) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'put', entityRoleUpdateObject);
    }
    /**
    * Get one entity role for a given entity
    */
    GetEntityRole(params) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'get');
    }
    /**
    * Get suggestion examples that would improve the accuracy of the entity model.
    */
    GetEntitySuggestions(params) {
        return this.createRequest('/{entityId}/suggest', params, 'get');
    }
}
module.exports = Entities;
