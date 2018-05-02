/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('../serviceBase');
class Endpoints extends ServiceBase {
    constructor() {
        super('/apps/{appId}/endpoints');
    }

    /**
    * Returns the available endpoint deployment regions and URLs.
    */
    ListEndpoints(params) {
        return this.createRequest('', params, 'get');
    }
}
module.exports = Endpoints;
