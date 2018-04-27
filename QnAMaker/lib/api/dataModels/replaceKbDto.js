

class ReplaceKbDTO {
    
    /**
    * @property {QnADTO[]} qnAList
    */

    
    constructor({qnAList /* QnADTO[] */} = {}) {
        Object.assign(this, {qnAList /* QnADTO[] */});
    }
}
ReplaceKbDTO.fromJSON = function(src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(ReplaceKbDTO.fromJSON);
    }
    
    src.qnAList = QnADTO.fromJSON(src.qnAList) || undefined;

    const {qnAList /* QnADTO[] */} = src;
    return new ReplaceKbDTO({qnAList /* QnADTO[] */});
};

module.exports = ReplaceKbDTO;
