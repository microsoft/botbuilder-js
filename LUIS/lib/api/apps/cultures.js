const {ServiceBase} = require('../serviceBase');

class Cultures extends ServiceBase {
    constructor() {
        super('/apps/cultures');
    }

    /**
     * Gets the supported LUIS application cultures.
     */
    getLUISApplicationCulturesList(params) {
        return this.createRequest('', params, 'get');
    }
}

module.exports = Cultures;
