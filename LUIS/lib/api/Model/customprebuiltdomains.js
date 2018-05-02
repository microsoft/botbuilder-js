const {ServiceBase} = require('../serviceBase');
class Customprebuiltdomains extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/customprebuiltdomains');
    }

    /**
    * Adds a customizable prebuilt domain along with all of its models to this application.
    */
    AddCustomPrebuiltDomain(params , prebuiltDomainObject/* PrebuiltDomainCreateBaseObject */) {
        return this.createRequest('', params, 'post', prebuiltDomainObject);
    }
    /**
    * Deletes a prebuilt domain's models from the application.
    */
    DeleteCustomPrebuiltDomain(params) {
        return this.createRequest('/{domainName}', params, 'delete');
    }
}
module.exports = Customprebuiltdomains;
