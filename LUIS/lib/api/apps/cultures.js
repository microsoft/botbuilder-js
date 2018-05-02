const {ServiceBase} = require('../serviceBase');
class Cultures extends ServiceBase {
    constructor() {
        super('/apps/cultures');
    }

    /**
    * Gets the supported application cultures.
    */
    ListSupportedCultures(params) {
        return this.createRequest('', params, 'get');
    }
}
module.exports = Cultures;
