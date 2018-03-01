const {ServiceBase} = require('./serviceBase');

class Assistants extends ServiceBase {
    constructor() {
        super('/apps/assistants');
    }

    /**
     * Gets the endpoint URLs for the prebuilt Cortana applications.
     */
    async getPersonalAssistantApplications() {
        return this.createRequest('get', []);
    }

}

module.exports = {Assistants};
