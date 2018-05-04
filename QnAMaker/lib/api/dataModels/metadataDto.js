/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */


class MetadataDTO {
    
    /**
    * @property {string} name
    */

    /**
    * @property {string} value
    */

    
    constructor({name /* string */,value /* string */} = {}) {
        Object.assign(this, {name /* string */,value /* string */});
    }
}
MetadataDTO.fromJSON = function(src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(MetadataDTO.fromJSON);
    }
    
    const {name /* string */,value /* string */} = src;
    return new MetadataDTO({name /* string */,value /* string */});
};

module.exports = MetadataDTO;
