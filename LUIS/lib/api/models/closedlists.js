const {ServiceBase} = require('../serviceBase');

class Closedlists extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/closedlists');
    }

    /**
     * Gets information about the closedlist models.
     */
    getVersionClosedlistList(params) {
        return this.createRequest('', params, 'get');
    }

    /**
     * Adds a list entity to the LUIS app.
     */
    createClosedListEntity(params, closedListModelCreateObject/* ClosedListModelCreateObject */) {
        return this.createRequest('', params, 'post', closedListModelCreateObject);
    }

    /**
     * Deletes a closed list model from the application.
     */
    deleteClosedListEntity(params) {
        return this.createRequest('/{clEntityId}', params, 'delete');
    }

    /**
     * Adds a batch of sublists to an existing closedlist.
     */
    patchClosedListEntity(params, closedListModelPatchObject/* ClosedListModelPatchObject */) {
        return this.createRequest('/{clEntityId}', params, 'patch', closedListModelPatchObject);
    }

    /**
     * Updates the closed list model.
     */
    updateClosedListEntity(params, closedListModelUpdateObject/* ClosedListModelUpdateObject */) {
        return this.createRequest('/{clEntityId}', params, 'put', closedListModelUpdateObject);
    }

    /**
     * Gets information of a closed list model.
     */
    getClosedListEntity(params) {
        return this.createRequest('/{clEntityId}', params, 'get');
    }

    /**
     * Adds a list to an existing closed list
     */
    addClosedListsSublist(params, wordListCreateObject/* WordListCreateObject */) {
        return this.createRequest('/{clEntityId}/sublists', params, 'post', wordListCreateObject);
    }

    /**
     * Updates one of the closed list's sublists
     */
    updateClosedlistsSublist(params, wordListBaseUpdateObject/* WordListBaseUpdateObject */) {
        return this.createRequest('/{clEntityId}/sublists/{subListId}', params, 'put', wordListBaseUpdateObject);
    }

    /**
     * Deletes a sublist of a specified list entity.
     */
    deleteSublistEntity(params) {
        return this.createRequest('/{clEntityId}/sublists/{subListId}', params, 'delete');
    }
}

module.exports = Closedlists;
