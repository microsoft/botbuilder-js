/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('../serviceBase');
class Prebuilts extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/prebuilts');
    }

    /**
    * Gets information about the prebuilt entity models.
    */
    ListPrebuilts(params) {
        return this.createRequest('', params, 'get');
    }
    /**
    * Adds a list of prebuilt entity extractors to the application.
    */
    AddPrebuilt(params , prebuiltExtractorNames/* PrebuiltExtractorNames */) {
        return this.createRequest('', params, 'post', prebuiltExtractorNames);
    }
    /**
    * undefined
    */
    CreatePrebuiltEntityRole(params , entityRoleCreateObject/* EntityRoleCreateObject */) {
        return this.createRequest('/{entityId}/roles', params, 'post', entityRoleCreateObject);
    }
    /**
    * undefined
    */
    GetPrebuiltEntityRoles(params) {
        return this.createRequest('/{entityId}/roles', params, 'get');
    }
    /**
    * undefined
    */
    DeletePrebuiltEntityRole(params) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'delete');
    }
    /**
    * undefined
    */
    UpdatePrebuiltEntityRole(params , entityRoleUpdateObject/* EntityRoleUpdateObject */) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'put', entityRoleUpdateObject);
    }
    /**
    * undefined
    */
    GetPrebuiltEntityRole(params) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'get');
    }
    /**
    * Deletes a prebuilt entity extractor from the application.
    */
    DeletePrebuilt(params) {
        return this.createRequest('/{prebuiltId}', params, 'delete');
    }
    /**
    * Gets information about the prebuilt entity model.
    */
    GetPrebuilt(params) {
        return this.createRequest('/{prebuiltId}', params, 'get');
    }
}
module.exports = Prebuilts;
