/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */


class UpdateQuestionsDTO {

    /**
    * @property {string[]} add
    */

    /**
    * @property {string[]} delete
    */


    constructor(src = {}) {
        Object.assign(this, src);
    }
}
UpdateQuestionsDTO.fromJSON = function (src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(UpdateQuestionsDTO.fromJSON);
    }

    return new UpdateQuestionsDTO(src);
};

module.exports = UpdateQuestionsDTO;
