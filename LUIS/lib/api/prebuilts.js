const {ServiceBase} = require('./serviceBase');

class Prebuilts extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/prebuilts');
    }

    /**
     * Gets information about the prebuilt entity models.
     */
    async getVersionPrebuiltEntityList() {
        return this.createRequest('get', ['skip', 'take']);
    }

    /**
     * Adds a list of prebuilt entity extractors to the application.
     */
    async addPrebuiltEntityList(prebuiltExtractorNames/* PrebuiltExtractorNames */) {
        return this.createRequest('post', [], prebuiltExtractorNames);
    }

    /**
     * Deletes a prebuilt entity extractor from the application.
     */
    async deletePrebuiltEntity() {
        return this.createRequest('delete', []);
    }

    /**
     * Gets information about the prebuilt entity model.
     */
    async getPrebuiltEntity() {
        return this.createRequest('get', []);
    }

}

module.exports = {Prebuilts};
