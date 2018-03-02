const {ServiceBase} = require('./serviceBase');

class Closedlists extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/closedlists');
    }

    /**
     * Gets information about the closedlist models.
     */
    async getVersionClosedlistList(params) {
        return this.createRequest('', params, 'get');
    }

    /**
     * Adds a list entity to the LUIS app.
     */
    async createClosedListEntity(params, closedListModelCreateObject/* ClosedListModelCreateObject */) {
        return this.createRequest('', params, 'post', closedListModelCreateObject);
    }

    /**
     * Deletes a closed list model from the application.
     */
    async deleteClosedListEntity(params) {
        return this.createRequest('/{clEntityId}', params, 'delete');
    }

    /**
     * Adds a batch of sublists to an existing closedlist.
     */
    async patchClosedListEntity(params, closedListModelPatchObject/* ClosedListModelPatchObject */) {
        return this.createRequest('/{clEntityId}', params, 'patch', closedListModelPatchObject);
    }

    /**
     * Updates the closed list model.
     */
    async updateClosedListEntity(params, closedListModelUpdateObject/* ClosedListModelUpdateObject */) {
        return this.createRequest('/{clEntityId}', params, 'put', closedListModelUpdateObject);
    }

    /**
     * Gets information of a closed list model.
     */
    async getClosedListEntity(params) {
        return this.createRequest('/{clEntityId}', params, 'get');
    }

    /**
     * Updates one of the closed list's sublists
     */
    async updateClosedlistsSublist(params, wordListBaseUpdateObject/* WordListBaseUpdateObject */) {
        return this.createRequest('/{clEntityId}/sublists/{subListId}', params, 'put', wordListBaseUpdateObject);
    }

    /**
     * Deletes a sublist of a specified list entity.
     */
    async deleteSublistEntity(params) {
        return this.createRequest('/{clEntityId}/sublists/{subListId}', params, 'delete');
    }

    /**
     * Adds a list to an existing closed list
     */
    async addClosedListsSublist(params, wordListCreateObject/* WordListCreateObject */) {
        return this.createRequest('/{clEntityId}/sublists', params, 'post', wordListCreateObject);
    }
}

module.exports = {Closedlists};
