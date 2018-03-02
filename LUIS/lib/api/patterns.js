const {ServiceBase} = require('./serviceBase');

class Patterns extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/patterns');
    }

    /**
     * Gets all application version pattern features.
     */
    async getVersionPatternFeatureList(params) {
        return this.createRequest('', params, 'get');
    }

    /**
     * Creates a new pattern feature.
     */
    async createPatternFeature(params, patternCreateObject/* PatternCreateObject */) {
        return this.createRequest('', params, 'post', patternCreateObject);
    }

    /**
     * Deletes a pattern feature from an application version.
     */
    async deletePatternFeature(params) {
        return this.createRequest('/{patternId}', params, 'delete');
    }

    /**
     * Updates the pattern, the name and the state of the pattern feature.
     */
    async updatePatternFeature(params, patternUpdateObject/* PatternUpdateObject */) {
        return this.createRequest('/{patternId}', params, 'put', patternUpdateObject);
    }

    /**
     * Gets pattern feature info.
     */
    async getPatternFeatureInfo(params) {
        return this.createRequest('/{patternId}', params, 'get');
    }
}

module.exports = {Patterns};
