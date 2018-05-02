

class EnqueueTrainingResponse {
    
    /**
    * @property {integer} statusId
    */

    /**
    * @property {undefined} status
    */

    
    constructor({statusId /* integer */,status /* undefined */} = {}) {
        Object.assign(this, {statusId /* integer */,status /* undefined */});
    }
}
EnqueueTrainingResponse.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(EnqueueTrainingResponse.fromJSON);
    }
    
    const {statusId /* integer */,status /* undefined */} = source;
    return new EnqueueTrainingResponse({statusId /* integer */,status /* undefined */});
};

module.exports = EnqueueTrainingResponse;
