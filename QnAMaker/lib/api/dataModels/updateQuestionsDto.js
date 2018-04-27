

class UpdateQuestionsDTO {
    
    /**
    * @property {string[]} add
    */

    /**
    * @property {string[]} delete
    */

    
    constructor({add /* string[] */,del /* string[] */} = {}) {
        Object.assign(this, {add /* string[] */});
        this.delete = del;
    }
}
UpdateQuestionsDTO.fromJSON = function(src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(UpdateQuestionsDTO.fromJSON);
    }
    
    return new UpdateQuestionsDTO(src);
};

module.exports = UpdateQuestionsDTO;
