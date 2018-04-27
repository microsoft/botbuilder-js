

class WordAlterationsDTO {
    
    /**
    * @property {AlterationsDTO[]} wordAlterations
    */

    
    constructor({wordAlterations /* AlterationsDTO[] */} = {}) {
        Object.assign(this, {wordAlterations /* AlterationsDTO[] */});
    }
}
WordAlterationsDTO.fromJSON = function(src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(WordAlterationsDTO.fromJSON);
    }
    
    src.wordAlterations = AlterationsDTO.fromJSON(src.wordAlterations) || undefined;

    const {wordAlterations /* AlterationsDTO[] */} = src;
    return new WordAlterationsDTO({wordAlterations /* AlterationsDTO[] */});
};

module.exports = WordAlterationsDTO;
