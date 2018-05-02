

class BatchLabelExample {
    
    /**
    * @property {undefined} value
    */

    /**
    * @property {boolean} hasError
    */

    /**
    * @property {undefined} error
    */

    
    constructor({value /* undefined */,hasError /* boolean */,error /* undefined */} = {}) {
        Object.assign(this, {value /* undefined */,hasError /* boolean */,error /* undefined */});
    }
}
BatchLabelExample.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(BatchLabelExample.fromJSON);
    }
    
    const {value /* undefined */,hasError /* boolean */,error /* undefined */} = source;
    return new BatchLabelExample({value /* undefined */,hasError /* boolean */,error /* undefined */});
};

module.exports = BatchLabelExample;
