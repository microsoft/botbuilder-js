/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('./serviceBase');
class Endpointkeys extends ServiceBase {
    constructor() {
        super('/endpointkeys');
    }

    /**
    * 
    */
    getEndpointKeys(params) {
        return this.createRequest('', params, 'get');
    }
    /**
    * 
    */
    refreshEndpointKeys(params) {
        return this.createRequest('', params, 'PATCH');
    }
}
module.exports = Endpointkeys;
