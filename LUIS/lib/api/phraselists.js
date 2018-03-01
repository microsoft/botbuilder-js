const {ServiceBase} = require('./serviceBase');

class Phraselists extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/phraselists');
    }

    /**
     * Gets all application phraselist features.
     */
    async getVersionPhraselistFeaturesList() {
        return this.createRequest('get', ['skip', 'take']);
    }

    /**
     * Creates a new phraselist feature.
     */
    async createPhraselistFeature(phraselistCreateObject/* PhraselistCreateObject */) {
        return this.createRequest('post', [], phraselistCreateObject);
    }

    /**
     * Deletes a phraselist feature from an application.
     */
    async deletePhraselistFeature() {
        return this.createRequest('delete', []);
    }

    /**
     * Updates the phrases, the state and the name of the phraselist feature.
     */
    async updatePhraselistFeature(phraselistUpdateObject/* PhraselistUpdateObject */) {
        return this.createRequest('put', [], phraselistUpdateObject);
    }

    /**
     * Gets phraselist feature info.
     */
    async getPhraselistFeatureInfo() {
        return this.createRequest('get', []);
    }

}

module.exports = {Phraselists};
