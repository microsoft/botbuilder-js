const {ServiceBase} = require('./serviceBase');

class Patterns extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/patterns');
    }

    /**
     * Gets all application version pattern features.
     */
    async getVersionPatternFeatureList() {
        return this.createRequest('get', ['skip', 'take']);
    }

    /**
     * Creates a new pattern feature.
     */
    async createPatternFeature(patternCreateObject/* PatternCreateObject */) {
        return this.createRequest('post', [], patternCreateObject);
    }

    /**
     * Deletes a pattern feature from an application version.
     */
    async deletePatternFeature() {
        return this.createRequest('delete', []);
    }

    /**
     * Updates the pattern, the name and the state of the pattern feature.
     */
    async updatePatternFeature(patternUpdateObject/* PatternUpdateObject */) {
        return this.createRequest('put', [], patternUpdateObject);
    }

    /**
     * Gets pattern feature info.
     */
    async getPatternFeatureInfo() {
        return this.createRequest('get', []);
    }

}

module.exports = {Patterns};
