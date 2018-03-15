const {ServiceBase} = require('../serviceBase');

class Intents extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/intents');
    }

    /**
     * Gets information about the intent models.
     */
    getVersionIntentList(params) {
        return this.createRequest('', params, 'get');
    }

    /**
     * Adds an intent classifier to the application.
     */
    createIntent(params, modelCreateObject/* ModelCreateObject */) {
        return this.createRequest('', params, 'post', modelCreateObject);
    }

    /**
     * Deletes an intent classifier from the application.
     */
    deleteIntent(params) {
        return this.createRequest('/{intentId}', params, 'delete');
    }

    /**
     * Updates the name of an intent classifier.
     */
    renameIntent(params, modelUpdateObject/* ModelUpdateObject */) {
        return this.createRequest('/{intentId}', params, 'put', modelUpdateObject);
    }

    /**
     * Gets information about the intent model.
     */
    getIntent(params) {
        return this.createRequest('/{intentId}', params, 'get');
    }

    /**
     * Suggests examples that would improve the accuracy of the intent model.
     */
    suggestEndpointQueriesForIntents(params) {
        return this.createRequest('/{intentId}/suggest', params, 'get');
    }
}

module.exports = Intents;
