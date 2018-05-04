/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */
const {ServiceBase} = require('./serviceBase');
class Endpointkeys extends ServiceBase {
    constructor() {
        super('/endpointkeys');
    }

    /**
    * Gets endpoint keys for an endpoint
    */
    getEndpointKeys(params) {
        return this.createRequest('', params, 'GET');
    }
    /**
    * Re-generates an endpoint key.
    */
    refreshEndpointKeys(params) {
        return this.createRequest('', params, 'PATCH');
    }
}
module.exports = Endpointkeys;
