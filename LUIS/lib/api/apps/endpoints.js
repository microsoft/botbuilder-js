const {ServiceBase} = require('../serviceBase');

class Endpoints extends ServiceBase {
    constructor() {
        super('/apps/{appId}/endpoints');
    }

    /**
     * Returns the available endpoint deployment regions and urls
     */
    getEndpoints(params) {
        return this.createRequest('', params, 'get');
    }
}

module.exports = Endpoints;
