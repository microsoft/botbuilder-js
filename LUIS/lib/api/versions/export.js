/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('../serviceBase');
class Export extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/export');
    }

    /**
    * Exports a LUIS application to JSON format.
    */
    Export(params) {
        return this.createRequest('', params, 'get');
    }
}
module.exports = Export;
