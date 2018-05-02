/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('../serviceBase');
class Assistants extends ServiceBase {
    constructor() {
        super('/apps/assistants');
    }

    /**
    * Gets the endpoint URLs for the prebuilt Cortana applications.
    */
    ListCortanaEndpoints(params) {
        return this.createRequest('', params, 'get');
    }
}
module.exports = Assistants;
