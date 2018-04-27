

class UpdateKbOperationDTO {

    /**
    * @property {undefined} add
    */

    /**
    * @property {undefined} delete
    */

    /**
    * @property {undefined} update
    */


    constructor({ add /* undefined */, del /* undefined */, update /* undefined */ } = {}) {
        Object.assign(this, { add /* undefined */, update /* undefined */ });
        this.delete = del;
    }
}
UpdateKbOperationDTO.fromJSON = function (src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(UpdateKbOperationDTO.fromJSON);
    }

    return new UpdateKbOperationDTO(src);
};

module.exports = UpdateKbOperationDTO;
