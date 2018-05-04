/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */
const {ServiceBase} = require('./serviceBase');
class Alterations extends ServiceBase {
    constructor() {
        super('/alterations');
    }

    /**
    * Replace alterations data.
    */
    replaceAlterations(params , wordAlterations/* WordAlterationsDTO */) {
        return this.createRequest('', params, 'PUT', wordAlterations);
    }
    /**
    * Download alterations from runtime.
    */
    downloadAlterations(params) {
        return this.createRequest('', params, 'GET');
    }
}
module.exports = Alterations;
