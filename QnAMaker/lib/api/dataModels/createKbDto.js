/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */
 const QnADTO = require('./qnAdto');
 const FileDTO = require('./fileDto');

 class CreateKbDTO {
    
    /**
    * @property {string} name
    */

    /**
    * @property {QnADTO[]} qnaList
    */

    /**
    * @property {string[]} urls
    */

    /**
    * @property {FileDTO[]} files
    */

    
    constructor({name /* string */,qnaList /* QnADTO[] */,urls /* string[] */,files /* FileDTO[] */} = {}) {
        Object.assign(this, {name /* string */,qnaList /* QnADTO[] */,urls /* string[] */,files /* FileDTO[] */});
    }
}
CreateKbDTO.fromJSON = function(src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(CreateKbDTO.fromJSON);
    }
    
    src.qnaList = QnADTO.fromJSON(src.qnaList) || undefined;

    src.files = FileDTO.fromJSON(src.files) || undefined;

    const {name /* string */,qnaList /* QnADTO[] */,urls /* string[] */,files /* FileDTO[] */} = src;
    return new CreateKbDTO({name /* string */,qnaList /* QnADTO[] */,urls /* string[] */,files /* FileDTO[] */});
};

module.exports = CreateKbDTO;
