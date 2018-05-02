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
    * undefined
    */
    CreateCustomPrebuiltEntityRole(params , entityRoleCreateObject/* EntityRoleCreateObject */) {
        return this.createRequest('/{entityId}/roles', params, 'post', entityRoleCreateObject);
    }
    /**
    * undefined
    */
    GetCustomPrebuiltEntityRoles(params) {
        return this.createRequest('/{entityId}/roles', params, 'get');
    }
    /**
    * undefined
    */
    DeleteCustomEntityRole(params) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'delete');
    }
    /**
    * undefined
    */
    UpdateCustomPrebuiltEntityRole(params , entityRoleUpdateObject/* EntityRoleUpdateObject */) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'put', entityRoleUpdateObject);
    }
    /**
    * undefined
    */
    GetCustomEntityRole(params) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'get');
    }
}
module.exports = Customprebuiltentities;
