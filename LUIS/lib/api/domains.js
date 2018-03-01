const {ServiceBase} = require('./serviceBase');

class Domains extends ServiceBase {
    constructor() {
        super('/apps/domains');
    }

    /**
     * Gets the available application domains.
     */
    async getLUISApplicationDomainsList() {
        return this.createRequest('get', []);
    }

}

module.exports = {Domains};
