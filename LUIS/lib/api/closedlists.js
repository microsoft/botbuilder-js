const {ServiceBase} = require('./serviceBase');

class Closedlists extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/closedlists');
    }

    /**
     * Gets information about the closedlist models.
     */
    async getVersionClosedlistList() {
        return this.createRequest('get', ['skip', 'take']);
    }

    /**
     * Adds a list entity to the LUIS app.
     */
    async createClosedListEntity(closedListModelCreateObject/* ClosedListModelCreateObject */) {
        return this.createRequest('post', [], closedListModelCreateObject);
    }

    /**
     * Deletes a closed list model from the application.
     */
    async deleteClosedListEntity() {
        return this.createRequest('delete', []);
    }

    /**
     * Adds a batch of sublists to an existing closedlist.
     */
    async patchClosedListEntity(closedListModelPatchObject/* ClosedListModelPatchObject */) {
        return this.createRequest('patch', [], closedListModelPatchObject);
    }

    /**
     * Updates the closed list model.
     */
    async updateClosedListEntity(closedListModelUpdateObject/* ClosedListModelUpdateObject */) {
        return this.createRequest('put', [], closedListModelUpdateObject);
    }

    /**
     * Gets information of a closed list model.
     */
    async getClosedListEntity() {
        return this.createRequest('get', []);
    }

    /**
     * Updates one of the closed list's sublists
     */
    async updateClosedlistsSublist(wordListBaseUpdateObject/* WordListBaseUpdateObject */) {
        return this.createRequest('put', [], wordListBaseUpdateObject);
    }

    /**
     * Deletes a sublist of a specified list entity.
     */
    async deleteSublistEntity() {
        return this.createRequest('delete', []);
    }

    /**
     * Adds a list to an existing closed list
     */
    async addClosedListsSublist(wordListCreateObject/* WordListCreateObject */) {
        return this.createRequest('post', [], wordListCreateObject);
    }

}

module.exports = {Closedlists};
