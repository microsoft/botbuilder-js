const {ServiceBase} = require('./serviceBase');

class Endpoints extends ServiceBase {
    constructor() {
        super('/apps/{appId}/endpoints');
    }

    /**
     * Returns the available endpoint deployment regions and urls
     */
    async getEndpoints() {
        return this.createRequest('get', []);
    }

}

module.exports = {Endpoints};
