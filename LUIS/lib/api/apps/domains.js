/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('../serviceBase');
class Domains extends ServiceBase {
    constructor() {
        super('/apps/domains');
    }

    /**
    * Gets the available application domains.
    */
    ListDomains(params) {
        return this.createRequest('', params, 'get');
    }
}
module.exports = Domains;
