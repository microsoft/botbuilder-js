const {ServiceBase} = require('../serviceBase');

class Phraselists extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/phraselists');
    }

    /**
     * Gets all application phraselist features.
     */
    async getVersionPhraselistFeaturesList(params) {
        return this.createRequest('', params, 'get');
    }

    /**
     * Creates a new phraselist feature.
     */
    async createPhraselistFeature(params, phraselistCreateObject/* PhraselistCreateObject */) {
        return this.createRequest('', params, 'post', phraselistCreateObject);
    }

    /**
     * Deletes a phraselist feature from an application.
     */
    async deletePhraselistFeature(params) {
        return this.createRequest('/{phraselistId}', params, 'delete');
    }

    /**
     * Updates the phrases, the state and the name of the phraselist feature.
     */
    async updatePhraselistFeature(params, phraselistUpdateObject/* PhraselistUpdateObject */) {
        return this.createRequest('/{phraselistId}', params, 'put', phraselistUpdateObject);
    }

    /**
     * Gets phraselist feature info.
     */
    async getPhraselistFeatureInfo(params) {
        return this.createRequest('/{phraselistId}', params, 'get');
    }
}

module.exports = Phraselists;
