

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
    
    source.qnAList = QnADTO.fromJSON(source.qnAList) || undefined;

    const {qnAList /* QnADTO[] */} = src;
    return new ReplaceKbDTO({qnAList /* QnADTO[] */});
};

module.exports = ReplaceKbDTO;
