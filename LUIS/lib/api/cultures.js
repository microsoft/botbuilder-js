const {ServiceBase} = require('./serviceBase');

class Cultures extends ServiceBase {
    constructor() {
        super('/apps/cultures');
    }

    /**
     * Gets the supported LUIS application cultures.
     */
    async getLUISApplicationCulturesList() {
        return this.createRequest('get', []);
    }

}

module.exports = {Cultures};
