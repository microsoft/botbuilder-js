/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */


class DeleteKbContentsDTO {
    
    /**
    * @property {integer[]} ids
    */

    /**
    * @property {string[]} sources
    */

    
    constructor({ids /* integer[] */,sources /* string[] */} = {}) {
        Object.assign(this, {ids /* integer[] */,sources /* string[] */});
    }
}
DeleteKbContentsDTO.fromJSON = function(src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(DeleteKbContentsDTO.fromJSON);
    }
    
    const {ids /* integer[] */,sources /* string[] */} = src;
    return new DeleteKbContentsDTO({ids /* integer[] */,sources /* string[] */});
};

module.exports = DeleteKbContentsDTO;
