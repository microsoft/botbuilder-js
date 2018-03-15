const {ServiceBase} = require('../serviceBase');

class Prebuilts extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/prebuilts');
    }

    /**
     * Gets information about the prebuilt entity models.
     */
    getVersionPrebuiltEntityList(params) {
        return this.createRequest('', params, 'get');
    }

    /**
     * Adds a list of prebuilt entity extractors to the application.
     */
    addPrebuiltEntityList(params, prebuiltExtractorNames/* PrebuiltExtractorNames */) {
        return this.createRequest('', params, 'post', prebuiltExtractorNames);
    }

    /**
     * Deletes a prebuilt entity extractor from the application.
     */
    deletePrebuiltEntity(params) {
        return this.createRequest('/{prebuiltId}', params, 'delete');
    }

    /**
     * Gets information about the prebuilt entity model.
     */
    getPrebuiltEntity(params) {
        return this.createRequest('/{prebuiltId}', params, 'get');
    }
}

module.exports = Prebuilts;
