const {ServiceBase} = require('../serviceBase');

class Domains extends ServiceBase {
    constructor() {
        super('/apps/domains');
    }

    /**
     * Gets the available application domains.
     */
    async getLUISApplicationDomainsList(params) {
        return this.createRequest('', params, 'get');
    }
}

module.exports = Domains;
