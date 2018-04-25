

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
    
    source.qnaList = QnADTO.fromJSON(source.qnaList) || undefined;

    source.files = FileDTO.fromJSON(source.files) || undefined;

    const {qnaList /* QnADTO[] */,urls /* string[] */,files /* FileDTO[] */} = src;
    return new CreateKbInputDTO({qnaList /* QnADTO[] */,urls /* string[] */,files /* FileDTO[] */});
};

module.exports = CreateKbInputDTO;
