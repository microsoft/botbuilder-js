/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */


class KnowledgebaseDTO {
    
    /**
    * @property {string} id
    */

    /**
    * @property {string} hostName
    */

    /**
    * @property {string} lastAccessedTimestamp
    */

    /**
    * @property {string} lastChangedTimestamp
    */

    /**
    * @property {string} lastPublishedTimestamp
    */

    /**
    * @property {string} name
    */

    /**
    * @property {string} userId
    */

    /**
    * @property {string[]} urls
    */

    /**
    * @property {string[]} sources
    */

    
    constructor({id /* string */,hostName /* string */,lastAccessedTimestamp /* string */,lastChangedTimestamp /* string */,lastPublishedTimestamp /* string */,name /* string */,userId /* string */,urls /* string[] */,sources /* string[] */} = {}) {
        Object.assign(this, {id /* string */,hostName /* string */,lastAccessedTimestamp /* string */,lastChangedTimestamp /* string */,lastPublishedTimestamp /* string */,name /* string */,userId /* string */,urls /* string[] */,sources /* string[] */});
    }
}
KnowledgebaseDTO.fromJSON = function(src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(KnowledgebaseDTO.fromJSON);
    }
    
    const {id /* string */,hostName /* string */,lastAccessedTimestamp /* string */,lastChangedTimestamp /* string */,lastPublishedTimestamp /* string */,name /* string */,userId /* string */,urls /* string[] */,sources /* string[] */} = src;
    return new KnowledgebaseDTO({id /* string */,hostName /* string */,lastAccessedTimestamp /* string */,lastChangedTimestamp /* string */,lastPublishedTimestamp /* string */,name /* string */,userId /* string */,urls /* string[] */,sources /* string[] */});
};

module.exports = KnowledgebaseDTO;
