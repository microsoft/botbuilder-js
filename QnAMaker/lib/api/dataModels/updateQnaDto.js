/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */


class UpdateQnaDTO {
    
    /**
    * @property {integer} id
    */

    /**
    * @property {string} answer
    */

    /**
    * @property {string} source
    */

    /**
    * @property {undefined} questions
    */

    /**
    * @property {undefined} metadata
    */

    
    constructor({id /* integer */,answer /* string */,source /* string */,questions /* undefined */,metadata /* undefined */} = {}) {
        Object.assign(this, {id /* integer */,answer /* string */,source /* string */,questions /* undefined */,metadata /* undefined */});
    }
}
UpdateQnaDTO.fromJSON = function(src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(UpdateQnaDTO.fromJSON);
    }
    
    const {id /* integer */,answer /* string */,source /* string */,questions /* undefined */,metadata /* undefined */} = src;
    return new UpdateQnaDTO({id /* integer */,answer /* string */,source /* string */,questions /* undefined */,metadata /* undefined */});
};

module.exports = UpdateQnaDTO;
