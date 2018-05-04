/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */
 const MetadataDTO = require('./metadataDto');

class QnADTO {
    
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
    * @property {string[]} questions
    */

    /**
    * @property {MetadataDTO[]} metadata
    */

    
    constructor({id /* integer */,answer /* string */,source /* string */,questions /* string[] */,metadata /* MetadataDTO[] */} = {}) {
        Object.assign(this, {id /* integer */,answer /* string */,source /* string */,questions /* string[] */,metadata /* MetadataDTO[] */});
    }
}
QnADTO.fromJSON = function(src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(QnADTO.fromJSON);
    }
    
    src.metadata = MetadataDTO.fromJSON(src.metadata) || undefined;

    const {id /* integer */,answer /* string */,source /* string */,questions /* string[] */,metadata /* MetadataDTO[] */} = src;
    return new QnADTO({id /* integer */,answer /* string */,source /* string */,questions /* string[] */,metadata /* MetadataDTO[] */});
};

module.exports = QnADTO;
