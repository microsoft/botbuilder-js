/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
const {ServiceBase} = require('../serviceBase');
class Closedlists extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/closedlists');
    }

    /**
    * Adds a closed list model to the application.
    */
    AddClosedList(params , closedListModelCreateObject/* ClosedListModelCreateObject */) {
        return this.createRequest('', params, 'post', closedListModelCreateObject);
    }
    /**
    * Gets information about the closedlist models.
    */
    ListClosedLists(params) {
        return this.createRequest('', params, 'get');
    }
    /**
    * Deletes a closed list model from the application.
    */
    DeleteClosedList(params) {
        return this.createRequest('/{clEntityId}', params, 'delete');
    }
    /**
    * Adds a batch of sublists to an existing closedlist.
    */
    PatchClosedList(params , closedListModelPatchObject/* ClosedListModelPatchObject */) {
        return this.createRequest('/{clEntityId}', params, 'patch', closedListModelPatchObject);
    }
    /**
    * Updates the closed list model.
    */
    UpdateClosedList(params , closedListModelUpdateObject/* ClosedListModelUpdateObject */) {
        return this.createRequest('/{clEntityId}', params, 'put', closedListModelUpdateObject);
    }
    /**
    * Gets information of a closed list model.
    */
    GetClosedList(params) {
        return this.createRequest('/{clEntityId}', params, 'get');
    }
    /**
    * Adds a list to an existing closed list.
    */
    AddSubList(params , wordListCreateObject/* WordListObject */) {
        return this.createRequest('/{clEntityId}/sublists', params, 'post', wordListCreateObject);
    }
    /**
    * Updates one of the closed list's sublists.
    */
    UpdateSubList(params , wordListBaseUpdateObject/* WordListBaseUpdateObject */) {
        return this.createRequest('/{clEntityId}/sublists/{subListId}', params, 'put', wordListBaseUpdateObject);
    }
    /**
    * Deletes a sublist of a specific closed list model.
    */
    DeleteSubList(params) {
        return this.createRequest('/{clEntityId}/sublists/{subListId}', params, 'delete');
    }
    /**
    * undefined
    */
    CreateClosedListEntityRole(params , entityRoleCreateObject/* EntityRoleCreateObject */) {
        return this.createRequest('/{entityId}/roles', params, 'post', entityRoleCreateObject);
    }
    /**
    * undefined
    */
    GetClosedListEntityRoles(params) {
        return this.createRequest('/{entityId}/roles', params, 'get');
    }
    /**
    * undefined
    */
    DeleteClosedListEntityRole(params) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'delete');
    }
    /**
    * undefined
    */
    UpdateClosedListEntityRole(params , entityRoleUpdateObject/* EntityRoleUpdateObject */) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'put', entityRoleUpdateObject);
    }
    /**
    * undefined
    */
    GetClosedListEntityRole(params) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'get');
    }
}
module.exports = Closedlists;
