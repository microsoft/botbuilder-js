const {ServiceBase} = require('../serviceBase');

class Train extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/train');
    }

    /**
     * Gets the training status of all models (intents and entities) for the specified LUIS app. You must <a href="https://westus.dev.cognitive.microsoft.com/docs/services/5890b47c39e2bb17b84a55ff/operations/5890b47c39e2bb052c5b9c45">call the train API</a> to train the LUIS app before you call this API to get training status.

     */
    async getVersionTrainingStatus(params) {
        return this.createRequest('', params, 'get');
    }

    /**
     * Sends a training request for a version of a specified LUIS app.

     This POST request initiates a request asynchronously. To determine whether the training request is successful, submit a GET request to get training status.

     * **Note**: The application version is not fully trained unless all the models (intents and entities) are trained successfully or are up to date.

     To verify training success, get the training status at least once after training is complete.
     */
    async trainApplicationVersion(params) {
        return this.createRequest('', params, 'post');
    }
}

module.exports = Train;
