const {ServiceBase} = require('./serviceBase');

class Usagescenarios extends ServiceBase {
    constructor() {
        super('/apps/usagescenarios');
    }

    /**
     * Gets the application available usage scenarios.
     */
    async getLUISApplicationUsageScenariosList() {
        return this.createRequest('get', []);
    }

}

module.exports = {Usagescenarios};
