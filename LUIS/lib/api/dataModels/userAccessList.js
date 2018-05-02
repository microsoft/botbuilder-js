/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class UserAccessList {
    
    /**
    * @property {string} owner
    */

    /**
    * @property {string[]} emails
    */

    
    constructor({owner /* string */,emails /* string[] */} = {}) {
        Object.assign(this, {owner /* string */,emails /* string[] */});
    }
}
UserAccessList.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(UserAccessList.fromJSON);
    }
    
    const {owner /* string */,emails /* string[] */} = source;
    return new UserAccessList({owner /* string */,emails /* string[] */});
};

module.exports = UserAccessList;
