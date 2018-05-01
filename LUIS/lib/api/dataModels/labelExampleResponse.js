

class LabelExampleResponse {
    
    /**
    * @property {string} utteranceText
    */

    /**
    * @property {integer} exampleId
    */

    
    constructor({utteranceText /* string */,exampleId /* integer */} = {}) {
        Object.assign(this, {utteranceText /* string */,exampleId /* integer */});
    }
}
LabelExampleResponse.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(LabelExampleResponse.fromJSON);
    }
    
    const {utteranceText /* string */,exampleId /* integer */} = source;
    return new LabelExampleResponse({utteranceText /* string */,exampleId /* integer */});
};

module.exports = LabelExampleResponse;
