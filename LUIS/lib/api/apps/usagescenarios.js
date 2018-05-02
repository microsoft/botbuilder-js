/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('../serviceBase');
class Usagescenarios extends ServiceBase {
    constructor() {
        super('/apps/usagescenarios');
    }

    /**
    * Gets the application available usage scenarios.
    */
    ListUsageScenarios(params) {
        return this.createRequest('', params, 'get');
    }
}
module.exports = Usagescenarios;
