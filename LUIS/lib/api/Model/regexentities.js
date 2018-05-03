/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('../serviceBase');
class Regexentities extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/regexentities');
    }

    /**
    * Adds a regex entity model to the application version.
    */
    CreateRegexEntityModel(params , regexEntityExtractorCreateObj/* RegexModelCreateObject */) {
        return this.createRequest('', params, 'post', regexEntityExtractorCreateObj);
    }
    /**
    * Gets information about the regex entity models.
    */
    GetRegexEntityInfos(params) {
        return this.createRequest('', params, 'get');
    }
    /**
    * Create an entity role for an entity in the application.
    */
    CreateRegexEntityRole(params , entityRoleCreateObject/* EntityRoleCreateObject */) {
        return this.createRequest('/{entityId}/roles', params, 'post', entityRoleCreateObject);
    }
    /**
    * Get All Entity Roles for a given entity
    */
    GetRegexEntityRoles(params) {
        return this.createRequest('/{entityId}/roles', params, 'get');
    }
    /**
    * Delete an entity role.
    */
    DeleteRegexEntityRole(params) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'delete');
    }
    /**
    * Update an entity role for a given entity
    */
    UpdateRegexEntityRole(params , entityRoleUpdateObject/* EntityRoleUpdateObject */) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'put', entityRoleUpdateObject);
    }
    /**
    * Get one entity role for a given entity
    */
    GetRegexEntityRole(params) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'get');
    }
    /**
    * Deletes a regex entity model from the application.
    */
    DeleteRegexEntityModel(params) {
        return this.createRequest('/{regexEntityId}', params, 'delete');
    }
    /**
    * Updates the regex entity model .
    */
    UpdateRegexEntityModel(params , regexEntityUpdateObject/* RegexModelUpdateObject */) {
        return this.createRequest('/{regexEntityId}', params, 'put', regexEntityUpdateObject);
    }
    /**
    * Gets information of a regex entity model.
    */
    GetRegexEntityEntityInfo(params) {
        return this.createRequest('/{regexEntityId}', params, 'get');
    }
}
module.exports = Regexentities;
