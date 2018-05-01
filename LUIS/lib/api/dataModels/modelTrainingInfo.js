

class ModelTrainingInfo {
    
    /**
    * @property {string} modelId
    */

    /**
    * @property {undefined} details
    */

    
    constructor({modelId /* string */,details /* undefined */} = {}) {
        Object.assign(this, {modelId /* string */,details /* undefined */});
    }
}
ModelTrainingInfo.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ModelTrainingInfo.fromJSON);
    }
    
    const {modelId /* string */,details /* undefined */} = source;
    return new ModelTrainingInfo({modelId /* string */,details /* undefined */});
};

module.exports = ModelTrainingInfo;
