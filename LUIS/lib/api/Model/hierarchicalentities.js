/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('../serviceBase');
class Hierarchicalentities extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/hierarchicalentities');
    }

    /**
    * Gets information about the hierarchical entity models.
    */
    ListHierarchicalEntities(params) {
        return this.createRequest('', params, 'get');
    }
    /**
    * Adds a hierarchical entity extractor to the application version.
    */
    AddHierarchicalEntity(params , hierarchicalModelCreateObject/* HierarchicalEntityModel */) {
        return this.createRequest('', params, 'post', hierarchicalModelCreateObject);
    }
    /**
    * Deletes a hierarchical entity extractor from the application version.
    */
    DeleteHierarchicalEntity(params) {
        return this.createRequest('/{hEntityId}', params, 'delete');
    }
    /**
    * Updates the name and children of a hierarchical entity model.
    */
    UpdateHierarchicalEntity(params , hierarchicalModelUpdateObject/* HierarchicalEntityModel */) {
        return this.createRequest('/{hEntityId}', params, 'put', hierarchicalModelUpdateObject);
    }
    /**
    * Gets information about the hierarchical entity model.
    */
    GetHierarchicalEntity(params) {
        return this.createRequest('/{hEntityId}', params, 'get');
    }
    /**
    * Creates a single child in an existing hierarchical entity model.
    */
    AddHierarchicalEntityChild(params , hierarchicalChildModelCreateObject) {
        return this.createRequest('/{hEntityId}/children', params, 'post', hierarchicalChildModelCreateObject);
    }
    /**
    * Deletes a hierarchical entity extractor child from the application.
    */
    DeleteHierarchicalEntityChild(params) {
        return this.createRequest('/{hEntityId}/children/{hChildId}', params, 'delete');
    }
    /**
    * Renames a single child in an existing hierarchical entity model.
    */
    UpdateHierarchicalEntityChild(params , hierarchicalChildModelUpdateObject) {
        return this.createRequest('/{hEntityId}/children/{hChildId}', params, 'put', hierarchicalChildModelUpdateObject);
    }
    /**
    * Gets information about the hierarchical entity child model.
    */
    GetHierarchicalEntityChild(params) {
        return this.createRequest('/{hEntityId}/children/{hChildId}', params, 'get');
    }
    /**
    * undefined
    */
    CreateHierarchicalEntityRole(params , entityRoleCreateObject/* EntityRoleCreateObject */) {
        return this.createRequest('/{hEntityId}/roles', params, 'post', entityRoleCreateObject);
    }
    /**
    * undefined
    */
    GetHierarchicalEntityRoles(params) {
        return this.createRequest('/{hEntityId}/roles', params, 'get');
    }
    /**
    * undefined
    */
    DeleteHierarchicalEntityRole(params) {
        return this.createRequest('/{hEntityId}/roles/{roleId}', params, 'delete');
    }
    /**
    * undefined
    */
    UpdateHierarchicalEntityRole(params , entityRoleUpdateObject/* EntityRoleUpdateObject */) {
        return this.createRequest('/{hEntityId}/roles/{roleId}', params, 'put', entityRoleUpdateObject);
    }
    /**
    * undefined
    */
    GetHierarchicalEntityRole(params) {
        return this.createRequest('/{hEntityId}/roles/{roleId}', params, 'get');
    }
}
module.exports = Hierarchicalentities;
