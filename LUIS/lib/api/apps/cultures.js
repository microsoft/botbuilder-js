const {ServiceBase} = require('../serviceBase');

class Cultures extends ServiceBase {
    constructor() {
        super('/apps/cultures');
    }

    /**
     * Gets the supported LUIS application cultures.
     */
    async getLUISApplicationCulturesList(params) {
        return this.createRequest('', params, 'get');
    }
}

module.exports = Cultures;
