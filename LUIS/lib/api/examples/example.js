const {ServiceBase} = require('../serviceBase');
class Example extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/example');
    }

    /**
    * Adds a labeled example to the application.
    */
    Add(params , exampleLabelObject/* ExampleLabelObject */) {
        return this.createRequest('', params, 'post', exampleLabelObject);
    }
}
module.exports = Example;
