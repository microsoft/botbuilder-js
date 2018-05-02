/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('../serviceBase');
class Intents extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/intents');
    }

    /**
    * Gets information about the intent models.
    */
    ListIntents(params) {
        return this.createRequest('', params, 'get');
    }
    /**
    * Adds an intent classifier to the application.
    */
    AddIntent(params , intentCreateObject/* ModelCreateObject */) {
        return this.createRequest('', params, 'post', intentCreateObject);
    }
    /**
    * Deletes an intent classifier from the application.
    */
    DeleteIntent(params) {
        return this.createRequest('/{intentId}', params, 'delete');
    }
    /**
    * Updates the name of an intent classifier.
    */
    UpdateIntent(params , modelUpdateObject/* ModelUpdateObject */) {
        return this.createRequest('/{intentId}', params, 'put', modelUpdateObject);
    }
    /**
    * Gets information about the intent model.
    */
    GetIntent(params) {
        return this.createRequest('/{intentId}', params, 'get');
    }
    /**
    * Suggests examples that would improve the accuracy of the intent model.
    */
    GetIntentSuggestions(params) {
        return this.createRequest('/{intentId}/suggest', params, 'get');
    }
}
module.exports = Intents;
