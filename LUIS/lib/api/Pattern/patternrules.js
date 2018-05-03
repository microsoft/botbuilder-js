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
    * Deletes the patterns with the specified IDs.
    */
    DeletePatterns(params , patternIds) {
        return this.createRequest('', params, 'delete', patternIds);
    }
    /**
    * Adds a batch of patterns to the specified application.
    */
    BatchAddPatterns(params , patterns) {
        return this.createRequest('', params, 'post', patterns);
    }
    /**
    * Updates patterns
    */
    UpdatePatterns(params , patterns) {
        return this.createRequest('', params, 'put', patterns);
    }
    /**
    * Returns an application version's patterns.
    */
    GetPatterns(params) {
        return this.createRequest('', params, 'get');
    }
    /**
    * Deletes the pattern with the specified ID.
    */
    DeletePattern(params) {
        return this.createRequest('/{patternId}', params, 'delete');
    }
    /**
    * Updates a pattern
    */
    UpdatePattern(params , pattern/* PatternRuleUpdateObject */) {
        return this.createRequest('/{patternId}', params, 'put', pattern);
    }
}
module.exports = Patternrules;
