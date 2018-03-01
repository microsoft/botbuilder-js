const {ServiceBase} = require('./serviceBase');

class Querylogs extends ServiceBase {
    constructor() {
        super('/apps/{appId}/querylogs');
    }

    /**
     * Gets the query logs of the past month for the application.
     */
    async downloadApplicationQueryLogs() {
        return this.createRequest('get', []);
    }

}

module.exports = {Querylogs};
