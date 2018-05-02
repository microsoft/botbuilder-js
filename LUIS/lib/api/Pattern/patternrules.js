/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('../serviceBase');
class Patternrules extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/patternrules');
    }

    /**
    * undefined
    */
    DeletePatterns(params , patternIds) {
        return this.createRequest('', params, 'delete', patternIds);
    }
    /**
    * undefined
    */
    BatchAddPatterns(params , patterns) {
        return this.createRequest('', params, 'post', patterns);
    }
    /**
    * undefined
    */
    UpdatePatterns(params , patterns) {
        return this.createRequest('', params, 'put', patterns);
    }
    /**
    * undefined
    */
    GetPatterns(params) {
        return this.createRequest('', params, 'get');
    }
    /**
    * undefined
    */
    DeletePattern(params) {
        return this.createRequest('/{patternId}', params, 'delete');
    }
    /**
    * undefined
    */
    UpdatePattern(params , pattern/* PatternRuleUpdateObject */) {
        return this.createRequest('/{patternId}', params, 'put', pattern);
    }
}
module.exports = Patternrules;
