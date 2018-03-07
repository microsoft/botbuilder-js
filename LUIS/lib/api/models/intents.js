const {ServiceBase} = require('../serviceBase');

class Intents extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/intents');
    }

    /**
     * Gets information about the intent models.
     */
    async getVersionIntentList(params) {
        return this.createRequest('', params, 'get');
    }

    /**
     * Adds an intent classifier to the application.
     */
    async createIntent(params, modelCreateObject/* ModelCreateObject */) {
        return this.createRequest('', params, 'post', modelCreateObject);
    }

    /**
     * Deletes an intent classifier from the application.
     */
    async deleteIntent(params) {
        return this.createRequest('/{intentId}', params, 'delete');
    }

    /**
     * Updates the name of an intent classifier.
     */
    async renameIntent(params, modelUpdateObject/* ModelUpdateObject */) {
        return this.createRequest('/{intentId}', params, 'put', modelUpdateObject);
    }

    /**
     * Gets information about the intent model.
     */
    async getIntent(params) {
        return this.createRequest('/{intentId}', params, 'get');
    }

    /**
     * Suggests examples that would improve the accuracy of the intent model.
     */
    async suggestEndpointQueriesForIntents(params) {
        return this.createRequest('/{intentId}/suggest', params, 'get');
    }
}

module.exports = Intents;
