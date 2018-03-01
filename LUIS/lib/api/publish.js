const {ServiceBase} = require('./serviceBase');

class Publish extends ServiceBase {
    constructor() {
        super('/apps/{appId}/publish');
    }

    /**
     * Publishes a specific version of the application.
     */
    async publishApplication(applicationPublishObject/* ApplicationPublishObject */) {
        return this.createRequest('post', [], applicationPublishObject);
    }

}

module.exports = {Publish};
