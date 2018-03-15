const {ServiceBase} = require('../serviceBase');

class Querylogs extends ServiceBase {
    constructor() {
        super('/apps/{appId}/querylogs');
    }

    /**
     * Gets the query logs of the past month for the application.
     */
    downloadApplicationQueryLogs(params) {
        return this.createRequest('', params, 'get');
    }
}

module.exports = Querylogs;
