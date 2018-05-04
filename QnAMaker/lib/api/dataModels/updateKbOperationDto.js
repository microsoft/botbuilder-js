/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */


class UpdateKbOperationDTO {

    /**
    * @property {undefined} add
    */

    /**
    * @property {undefined} delete
    */

    /**
    * @property {undefined} update
    */


    constructor(src = {}) {
        Object.assign(this, src);
    }
}
UpdateKbOperationDTO.fromJSON = function (src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(UpdateKbOperationDTO.fromJSON);
    }

    return new UpdateKbOperationDTO(src);
};

module.exports = UpdateKbOperationDTO;
