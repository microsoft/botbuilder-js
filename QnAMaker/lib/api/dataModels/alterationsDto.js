/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */


class AlterationsDTO {
    
    /**
    * @property {string[]} alterations
    */

    
    constructor({alterations /* string[] */} = {}) {
        Object.assign(this, {alterations /* string[] */});
    }
}
AlterationsDTO.fromJSON = function(src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(AlterationsDTO.fromJSON);
    }
    
    const {alterations /* string[] */} = src;
    return new AlterationsDTO({alterations /* string[] */});
};

module.exports = AlterationsDTO;
