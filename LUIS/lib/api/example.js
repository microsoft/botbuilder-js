const {ServiceBase} = require('./serviceBase');

class Example extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/example');
    }

    /**
     * Adds a labeled example to the application.
     */
    async addLabel(exampleLabelObject/* ExampleLabelObject */) {
        return this.createRequest('post', [], exampleLabelObject);
    }

}

module.exports = {Example};
