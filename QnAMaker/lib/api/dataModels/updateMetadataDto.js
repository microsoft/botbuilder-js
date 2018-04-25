

class UpdateMetadataDTO {
    
    /**
    * @property {MetadataDTO[]} delete
    */

    /**
    * @property {MetadataDTO[]} add
    */

    
    constructor({del /* MetadataDTO[] */,add /* MetadataDTO[] */} = {}) {
        Object.assign(this, {add /* MetadataDTO[] */});
        this.delete = del;
    }
}
UpdateMetadataDTO.fromJSON = function(src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(UpdateMetadataDTO.fromJSON);
    }
    
    return new UpdateMetadataDTO(src);
};

module.exports = UpdateMetadataDTO;
