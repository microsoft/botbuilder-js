/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('./serviceBase');
class Operations extends ServiceBase {
    constructor() {
        super('/operations/{operationId}');
    }

    /**
    * 
    */
    getOperationDetails(params) {
        return this.createRequest('', params, 'get');
    }
}
module.exports = Operations;
