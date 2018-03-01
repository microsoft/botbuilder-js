const {ServiceBase} = require('./serviceBase');

class Intents extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/intents');
    }

    /**
     * Gets information about the intent models.
     */
    async getVersionIntentList() {
        return this.createRequest('get', ['skip', 'take']);
    }

    /**
     * Adds an intent classifier to the application.
     */
    async createIntent(modelCreateObject/* ModelCreateObject */) {
        return this.createRequest('post', [], modelCreateObject);
    }

    /**
     * Deletes an intent classifier from the application.
     */
    async deleteIntent() {
        return this.createRequest('delete', []);
    }

    /**
     * Updates the name of an intent classifier.
     */
    async renameIntent(modelUpdateObject/* ModelUpdateObject */) {
        return this.createRequest('put', [], modelUpdateObject);
    }

    /**
     * Gets information about the intent model.
     */
    async getIntent() {
        return this.createRequest('get', []);
    }

    /**
     * Suggests examples that would improve the accuracy of the intent model.
     */
    async suggestEndpointQueriesForIntents() {
        return this.createRequest('get', ['take']);
    }

}

module.exports = {Intents};
