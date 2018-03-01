const {ServiceBase} = require('./serviceBase');

class Customprebuiltdomains extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/customprebuiltdomains');
    }

    /**
     * Adds a customizable prebuilt domain along with all of its models to this application.
     */
    async addCustomPrebuiltDomain(prebuiltDomainCreateBaseObject/* PrebuiltDomainCreateBaseObject */) {
        return this.createRequest('post', [], prebuiltDomainCreateBaseObject);
    }

    /**
     * Deletes a prebuilt domain's models from the application.
     */
    async deleteCustomPrebuiltDomain() {
        return this.createRequest('delete', []);
    }

    /**
     * Adds a prebuilt domain along with its models as a new application. Returns new app ID.
     */
    async addPrebuiltApplication(prebuiltDomainCreateObject/* PrebuiltDomainCreateObject */) {
        return this.createRequest('post', [], prebuiltDomainCreateObject);
    }

    /**
     * Gets all the available custom prebuilt domains for all cultures
     */
    async getLUISPrebuiltDomainsList() {
        return this.createRequest('get', []);
    }

    /**
     * Gets all the available custom prebuilt domains for a specific culture
     */
    async getLUISPrebuiltDomainsForCultureList() {
        return this.createRequest('get', []);
    }

}

module.exports = {Customprebuiltdomains};
