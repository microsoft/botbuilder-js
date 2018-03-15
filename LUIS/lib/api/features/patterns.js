const {ServiceBase} = require('../serviceBase');

class Patterns extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/patterns');
    }

    /**
     * Gets all application version pattern features.
     */
    getVersionPatternFeatureList(params) {
        return this.createRequest('', params, 'get');
    }

    /**
     * Creates a new pattern feature.
     */
    createPatternFeature(params, patternCreateObject/* PatternCreateObject */) {
        return this.createRequest('', params, 'post', patternCreateObject);
    }

    /**
     * Deletes a pattern feature from an application version.
     */
    deletePatternFeature(params) {
        return this.createRequest('/{patternId}', params, 'delete');
    }

    /**
     * Updates the pattern, the name and the state of the pattern feature.
     */
    updatePatternFeature(params, patternUpdateObject/* PatternUpdateObject */) {
        return this.createRequest('/{patternId}', params, 'put', patternUpdateObject);
    }

    /**
     * Gets pattern feature info.
     */
    getPatternFeatureInfo(params) {
        return this.createRequest('/{patternId}', params, 'get');
    }
}

module.exports = Patterns;
