const {ServiceBase} = require('../serviceBase');

class Examples extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/examples');
    }

    /**
     * Returns examples to be reviewed.
     */
    async reviewLabeledExamples(params) {
        return this.createRequest('', params, 'get');
    }

    /**
     * Adds a batch of labeled examples to the specified application.

     The maximum batch size is 100 items.

     If the item has the ExampleId and a value between 0 - 99, the returned result will also include the ExampleId. This is helpful if items have errors.

     Some items can pass while others fail. The returned result will indicate each item's status.

     */
    async batchAddLabels(params, exampleLabelObjectArray/* ExampleLabelObjectArray */) {
        return this.createRequest('', params, 'post', exampleLabelObjectArray);
    }

    /**
     * Deletes the label with the specified ID.
     */
    async deleteExampleLabels(params) {
        return this.createRequest('/{exampleId}', params, 'delete');
    }
}

module.exports = Examples;
