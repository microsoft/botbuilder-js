const {ServiceBase} = require('./serviceBase');
class Endpointkeys extends ServiceBase {
    constructor() {
        super('/endpointkeys');
    }

    /**
    * 
    */
    getEndpointKeys(params) {
        return this.createRequest('', params, 'get');
    }
    /**
    * 
    */
    refreshEndpointKeys(params) {
        return this.createRequest('', params, 'patch');
    }
}
module.exports = Endpointkeys;
