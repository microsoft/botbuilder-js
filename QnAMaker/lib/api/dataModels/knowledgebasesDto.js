/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */


class KnowledgebasesDTO {
    
    /**
    * @property {KnowledgebaseDTO[]} knowledgebases
    */

    
    constructor({knowledgebases /* KnowledgebaseDTO[] */} = {}) {
        Object.assign(this, {knowledgebases /* KnowledgebaseDTO[] */});
    }
}
KnowledgebasesDTO.fromJSON = function(src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(KnowledgebasesDTO.fromJSON);
    }
    
    src.knowledgebases = KnowledgebaseDTO.fromJSON(src.knowledgebases) || undefined;

    const {knowledgebases /* KnowledgebaseDTO[] */} = src;
    return new KnowledgebasesDTO({knowledgebases /* KnowledgebaseDTO[] */});
};

module.exports = KnowledgebasesDTO;
