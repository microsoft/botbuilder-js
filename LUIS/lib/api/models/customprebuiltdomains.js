const {ServiceBase} = require('../serviceBase');

class Customprebuiltdomains extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/customprebuiltdomains');
    }

    /**
     * Adds a customizable prebuilt domain along with all of its models to this application.
     */
    addCustomPrebuiltDomain(params, prebuiltDomainCreateBaseObject/* PrebuiltDomainCreateBaseObject */) {
        return this.createRequest('', params, 'post', prebuiltDomainCreateBaseObject);
    }

    /**
     * Deletes a prebuilt domain's models from the application.
     */
    deleteCustomPrebuiltDomain(params) {
        return this.createRequest('/{domainName}', params, 'delete');
    }
}

module.exports = Customprebuiltdomains;
