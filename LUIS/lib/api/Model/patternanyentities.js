/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('../serviceBase');
class Patternanyentities extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/patternanyentities');
    }

    /**
    * Adds a pattern.any entity extractor to the application.
    */
    CreatePatteryAnyEntityModel(params , extractorCreateObject/* PatternAnyModelCreateObject */) {
        return this.createRequest('', params, 'post', extractorCreateObject);
    }
    /**
    * Get information about the Pattern.Any entity models.
    */
    GetPatternAnyEntityInfos(params) {
        return this.createRequest('', params, 'get');
    }
    /**
    * Deletes a Pattern.Any entity extractor from the application.
    */
    DeletePatternAnyEntityModel(params) {
        return this.createRequest('/{entityId}', params, 'delete');
    }
    /**
    * Updates the name and explicit list of a Pattern.Any entity model.
    */
    UpdatePatternAnyEntityModel(params , patternAnyUpdateObject/* PatternAnyModelUpdateObject */) {
        return this.createRequest('/{entityId}', params, 'put', patternAnyUpdateObject);
    }
    /**
    * Gets information about the application version's Pattern.Any model.
    */
    GetPatternAnyEntityInfo(params) {
        return this.createRequest('/{entityId}', params, 'get');
    }
    /**
    * Add a new item to the explicit list for the Pattern.Any entity.
    */
    AddExplicitListItem(params , item/* ExplicitListItemCreateObject */) {
        return this.createRequest('/{entityId}/explicitlist', params, 'post', item);
    }
    /**
    * Get the explicit list of the pattern.any entity.
    */
    GetExplicitList(params) {
        return this.createRequest('/{entityId}/explicitlist', params, 'get');
    }
    /**
    * Delete the explicit list item from the Pattern.any explicit list.
    */
    DeleteExplicitListItem(params) {
        return this.createRequest('/{entityId}/explicitlist/{itemId}', params, 'delete');
    }
    /**
    * Updates an explicit list item for a Pattern.Any entity.
    */
    UpdateExplicitListItem(params , item/* ExplicitListItemUpdateObject */) {
        return this.createRequest('/{entityId}/explicitlist/{itemId}', params, 'put', item);
    }
    /**
    * Get the explicit list of the pattern.any entity.
    */
    GetExplicitListItem(params) {
        return this.createRequest('/{entityId}/explicitlist/{itemId}', params, 'get');
    }
    /**
    * Create an entity role for an entity in the application.
    */
    CreatePatternAnyEntityRole(params , entityRoleCreateObject/* EntityRoleCreateObject */) {
        return this.createRequest('/{entityId}/roles', params, 'post', entityRoleCreateObject);
    }
    /**
    * Get All Entity Roles for a given entity
    */
    GetPatternAnyEntityRoles(params) {
        return this.createRequest('/{entityId}/roles', params, 'get');
    }
    /**
    * Delete an entity role.
    */
    DeletePatternAnyEntityRole(params) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'delete');
    }
    /**
    * Update an entity role for a given entity
    */
    UpdatePatternAnyEntityRole(params , entityRoleUpdateObject/* EntityRoleUpdateObject */) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'put', entityRoleUpdateObject);
    }
    /**
    * Get one entity role for a given entity
    */
    GetPatternAnyEntityRole(params) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'get');
    }
}
module.exports = Patternanyentities;
