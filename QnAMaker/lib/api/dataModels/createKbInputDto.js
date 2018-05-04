/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */


class CreateKbInputDTO {
    
    /**
    * @property {QnADTO[]} qnaList
    */

    /**
    * @property {string[]} urls
    */

    /**
    * @property {FileDTO[]} files
    */

    
    constructor({qnaList /* QnADTO[] */,urls /* string[] */,files /* FileDTO[] */} = {}) {
        Object.assign(this, {qnaList /* QnADTO[] */,urls /* string[] */,files /* FileDTO[] */});
    }
}
CreateKbInputDTO.fromJSON = function(src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(CreateKbInputDTO.fromJSON);
    }
    
    src.qnaList = QnADTO.fromJSON(src.qnaList) || undefined;

    src.files = FileDTO.fromJSON(src.files) || undefined;

    const {qnaList /* QnADTO[] */,urls /* string[] */,files /* FileDTO[] */} = src;
    return new CreateKbInputDTO({qnaList /* QnADTO[] */,urls /* string[] */,files /* FileDTO[] */});
};

module.exports = CreateKbInputDTO;
