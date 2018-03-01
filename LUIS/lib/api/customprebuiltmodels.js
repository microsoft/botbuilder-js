const {ServiceBase} = require('./serviceBase');

class Customprebuiltmodels extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/customprebuiltmodels');
    }

    /**
     * Gets all custom prebuilt models information of this application
     */
    async getCustomPrebuiltDomainModelsList() {
        return this.createRequest('get', []);
    }

}

module.exports = {Customprebuiltmodels};
