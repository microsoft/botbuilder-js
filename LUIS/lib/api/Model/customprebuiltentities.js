/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('../serviceBase');
class Customprebuiltentities extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/customprebuiltentities');
    }

    /**
    * Gets all custom prebuilt entities information of this application.
    */
    ListCustomPrebuiltEntities(params) {
        return this.createRequest('', params, 'get');
    }
    /**
    * Adds a custom prebuilt entity model to the application.
    */
    AddCustomPrebuiltEntity(params , prebuiltDomainModelCreateObject/* PrebuiltDomainModelCreateObject */) {
        return this.createRequest('', params, 'post', prebuiltDomainModelCreateObject);
    }
    /**
    * Create an entity role for an entity in the application.
    */
    CreateCustomPrebuiltEntityRole(params , entityRoleCreateObject/* EntityRoleCreateObject */) {
        return this.createRequest('/{entityId}/roles', params, 'post', entityRoleCreateObject);
    }
    /**
    * Get All Entity Roles for a given entity
    */
    GetCustomPrebuiltEntityRoles(params) {
        return this.createRequest('/{entityId}/roles', params, 'get');
    }
    /**
    * Delete an entity role.
    */
    DeleteCustomEntityRole(params) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'delete');
    }
    /**
    * Update an entity role for a given entity
    */
    UpdateCustomPrebuiltEntityRole(params , entityRoleUpdateObject/* EntityRoleUpdateObject */) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'put', entityRoleUpdateObject);
    }
    /**
    * Get one entity role for a given entity
    */
    GetCustomEntityRole(params) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'get');
    }
}
module.exports = Customprebuiltentities;
