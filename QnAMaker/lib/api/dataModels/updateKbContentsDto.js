/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */


class UpdateKbContentsDTO {
    
    /**
    * @property {string} name
    */

    /**
    * @property {UpdateQnaDTO[]} qnaList
    */

    /**
    * @property {string[]} urls
    */

    
    constructor({name /* string */,qnaList /* UpdateQnaDTO[] */,urls /* string[] */} = {}) {
        Object.assign(this, {name /* string */,qnaList /* UpdateQnaDTO[] */,urls /* string[] */});
    }
}
UpdateKbContentsDTO.fromJSON = function(src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(UpdateKbContentsDTO.fromJSON);
    }
    
    src.qnaList = UpdateQnaDTO.fromJSON(src.qnaList) || undefined;

    const {name /* string */,qnaList /* UpdateQnaDTO[] */,urls /* string[] */} = src;
    return new UpdateKbContentsDTO({name /* string */,qnaList /* UpdateQnaDTO[] */,urls /* string[] */});
};

module.exports = UpdateKbContentsDTO;
