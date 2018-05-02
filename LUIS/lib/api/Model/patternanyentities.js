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
    * undefined
    */
    CreatePatteryAnyEntityModel(params , extractorCreateObject/* PatternAnyModelCreateObject */) {
        return this.createRequest('', params, 'post', extractorCreateObject);
    }
    /**
    * undefined
    */
    GetPatternAnyEntityInfos(params) {
        return this.createRequest('', params, 'get');
    }
    /**
    * undefined
    */
    DeletePatternAnyEntityModel(params) {
        return this.createRequest('/{entityId}', params, 'delete');
    }
    /**
    * undefined
    */
    UpdatePatternAnyEntityModel(params , patternAnyUpdateObject/* PatternAnyModelUpdateObject */) {
        return this.createRequest('/{entityId}', params, 'put', patternAnyUpdateObject);
    }
    /**
    * undefined
    */
    GetPatternAnyEntityInfo(params) {
        return this.createRequest('/{entityId}', params, 'get');
    }
    /**
    * undefined
    */
    AddExplicitListItem(params , item/* ExplicitListItemCreateObject */) {
        return this.createRequest('/{entityId}/explicitlist', params, 'post', item);
    }
    /**
    * undefined
    */
    GetExplicitList(params) {
        return this.createRequest('/{entityId}/explicitlist', params, 'get');
    }
    /**
    * undefined
    */
    DeleteExplicitListItem(params) {
        return this.createRequest('/{entityId}/explicitlist/{itemId}', params, 'delete');
    }
    /**
    * undefined
    */
    UpdateExplicitListItem(params , item/* ExplicitListItemUpdateObject */) {
        return this.createRequest('/{entityId}/explicitlist/{itemId}', params, 'put', item);
    }
    /**
    * undefined
    */
    GetExplicitListItem(params) {
        return this.createRequest('/{entityId}/explicitlist/{itemId}', params, 'get');
    }
    /**
    * undefined
    */
    CreatePatternAnyEntityRole(params , entityRoleCreateObject/* EntityRoleCreateObject */) {
        return this.createRequest('/{entityId}/roles', params, 'post', entityRoleCreateObject);
    }
    /**
    * undefined
    */
    GetPatternAnyEntityRoles(params) {
        return this.createRequest('/{entityId}/roles', params, 'get');
    }
    /**
    * undefined
    */
    DeletePatternAnyEntityRole(params) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'delete');
    }
    /**
    * undefined
    */
    UpdatePatternAnyEntityRole(params , entityRoleUpdateObject/* EntityRoleUpdateObject */) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'put', entityRoleUpdateObject);
    }
    /**
    * undefined
    */
    GetPatternAnyEntityRole(params) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'get');
    }
}
module.exports = Patternanyentities;
