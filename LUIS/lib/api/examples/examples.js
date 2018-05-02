/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('../serviceBase');
class Examples extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/examples');
    }

    /**
    * Returns examples to be reviewed.
    */
    List(params) {
        return this.createRequest('', params, 'get');
    }
    /**
    * Adds a batch of labeled examples to the application.
    */
    Batch(params , exampleLabelObjectArray/* ExampleLabelObjectArray */) {
        return this.createRequest('', params, 'post', exampleLabelObjectArray);
    }
    /**
    * Deletes the labeled example with the specified ID.
    */
    Delete(params) {
        return this.createRequest('/{exampleId}', params, 'delete');
    }
}
module.exports = Examples;
