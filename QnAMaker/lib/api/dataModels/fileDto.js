/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */


class FileDTO {
    
    /**
    * @property {string} fileName
    */

    /**
    * @property {string} fileUri
    */

    
    constructor({fileName /* string */,fileUri /* string */} = {}) {
        Object.assign(this, {fileName /* string */,fileUri /* string */});
    }
}
FileDTO.fromJSON = function(src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(FileDTO.fromJSON);
    }
    
    const {fileName /* string */,fileUri /* string */} = src;
    return new FileDTO({fileName /* string */,fileUri /* string */});
};

module.exports = FileDTO;
