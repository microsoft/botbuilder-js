/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */


class QnADocumentsDTO {
    
    /**
    * @property {QnADTO[]} qnaDocuments
    */

    
    constructor({qnaDocuments /* QnADTO[] */} = {}) {
        Object.assign(this, {qnaDocuments /* QnADTO[] */});
    }
}
QnADocumentsDTO.fromJSON = function(src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(QnADocumentsDTO.fromJSON);
    }
    
    src.qnaDocuments = QnADTO.fromJSON(src.qnaDocuments) || undefined;

    const {qnaDocuments /* QnADTO[] */} = src;
    return new QnADocumentsDTO({qnaDocuments /* QnADTO[] */});
};

module.exports = QnADocumentsDTO;
