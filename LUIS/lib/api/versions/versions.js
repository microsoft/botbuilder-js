/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('../serviceBase');
class Versions extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions');
    }

    /**
    * Gets the application versions info.
    */
    List(params) {
        return this.createRequest('', params, 'get');
    }
    /**
    * Imports a new version into a LUIS application.
    */
    Import(params , luisApp/* LuisApp */) {
        return this.createRequest('/import', params, 'post', luisApp);
    }
    /**
    * Deletes an application version.
    */
    Delete(params) {
        return this.createRequest('/{versionId}/', params, 'delete');
    }
    /**
    * Updates the name or description of the application version.
    */
    Update(params , versionUpdateObject/* TaskUpdateObject */) {
        return this.createRequest('/{versionId}/', params, 'put', versionUpdateObject);
    }
    /**
    * Gets the version info.
    */
    Get(params) {
        return this.createRequest('/{versionId}/', params, 'get');
    }
}
module.exports = Versions;
