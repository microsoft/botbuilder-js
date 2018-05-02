/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('../serviceBase');
class Customprebuiltintents extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/customprebuiltintents');
    }

    /**
    * Gets custom prebuilt intents information of this application.
    */
    ListCustomPrebuiltIntents(params) {
        return this.createRequest('', params, 'get');
    }
    /**
    * Adds a custom prebuilt intent model to the application.
    */
    AddCustomPrebuiltIntent(params , prebuiltDomainModelCreateObject/* PrebuiltDomainModelCreateObject */) {
        return this.createRequest('', params, 'post', prebuiltDomainModelCreateObject);
    }
}
module.exports = Customprebuiltintents;
