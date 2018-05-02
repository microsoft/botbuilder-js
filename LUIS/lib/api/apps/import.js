/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('../serviceBase');
class Import extends ServiceBase {
    constructor() {
        super('/apps/import');
    }

    /**
    * Imports an application to LUIS, the application's structure should be included in in the request body.
    */
    Import(params , luisApp/* LuisApp */) {
        return this.createRequest('', params, 'post', luisApp);
    }
}
module.exports = Import;
