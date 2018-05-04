/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */


class UpdateMetadataDTO {
    
    /**
    * @property {MetadataDTO[]} delete
    */

    /**
    * @property {MetadataDTO[]} add
    */

    
    constructor(src = {}) {
        Object.assign(this, src);
    }
}
UpdateMetadataDTO.fromJSON = function(src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(UpdateMetadataDTO.fromJSON);
    }
    
    return new UpdateMetadataDTO(src);
};

module.exports = UpdateMetadataDTO;
