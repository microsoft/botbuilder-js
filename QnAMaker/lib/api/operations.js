/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */
const {ServiceBase} = require('./serviceBase');
class Operations extends ServiceBase {
    constructor() {
        super('/operations/{operationId}');
    }

    /**
    * Gets details of a specific long running operation.
    */
    getOperationDetails(params) {
        return this.createRequest('', params, 'GET');
    }
}
module.exports = Operations;
