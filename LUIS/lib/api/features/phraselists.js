/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('../serviceBase');
class Phraselists extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/phraselists');
    }

    /**
    * Gets all the phraselist features.
    */
    ListPhraseLists(params) {
        return this.createRequest('', params, 'get');
    }
    /**
    * Creates a new phraselist feature.
    */
    AddPhraseList(params , phraselistCreateObject/* PhraselistCreateObject */) {
        return this.createRequest('', params, 'post', phraselistCreateObject);
    }
    /**
    * Deletes a phraselist feature.
    */
    DeletePhraseList(params) {
        return this.createRequest('/{phraselistId}', params, 'delete');
    }
    /**
    * Updates the phrases, the state and the name of the phraselist feature.
    */
    UpdatePhraseList(params , phraselistUpdateObject/* PhraselistUpdateObject */) {
        return this.createRequest('/{phraselistId}', params, 'put', phraselistUpdateObject);
    }
    /**
    * Gets phraselist feature info.
    */
    GetPhraseList(params) {
        return this.createRequest('/{phraselistId}', params, 'get');
    }
}
module.exports = Phraselists;
