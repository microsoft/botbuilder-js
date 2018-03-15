const {ServiceBase} = require('../serviceBase');

class Usagescenarios extends ServiceBase {
    constructor() {
        super('/apps/usagescenarios');
    }

    /**
     * Gets the application available usage scenarios.
     */
    getLUISApplicationUsageScenariosList(params) {
        return this.createRequest('', params, 'get');
    }
}

module.exports = Usagescenarios;
