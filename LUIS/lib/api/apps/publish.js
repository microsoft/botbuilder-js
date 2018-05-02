/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('../serviceBase');
class Publish extends ServiceBase {
    constructor() {
        super('/apps/{appId}/publish');
    }

    /**
    * Publishes a specific version of the application.
    */
    Publish(params , applicationPublishObject/* ApplicationPublishObject */) {
        return this.createRequest('', params, 'post', applicationPublishObject);
    }
}
module.exports = Publish;
