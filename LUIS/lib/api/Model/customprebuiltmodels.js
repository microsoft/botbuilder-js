const {ServiceBase} = require('../serviceBase');
class Customprebuiltmodels extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/customprebuiltmodels');
    }

    /**
    * Gets all custom prebuilt models information of this application.
    */
    ListCustomPrebuiltModels(params) {
        return this.createRequest('', params, 'get');
    }
}
module.exports = Customprebuiltmodels;
