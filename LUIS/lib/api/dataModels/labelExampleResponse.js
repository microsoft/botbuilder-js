/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class LabelExampleResponse {
    
    /**
    * @property {string} UtteranceText
    */

    /**
    * @property {integer} ExampleId
    */

    
    constructor({UtteranceText /* string */,ExampleId /* integer */} = {}) {
        Object.assign(this, {UtteranceText /* string */,ExampleId /* integer */});
    }
}
LabelExampleResponse.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(LabelExampleResponse.fromJSON);
    }
    
    const {UtteranceText /* string */,ExampleId /* integer */} = source;
    return new LabelExampleResponse({UtteranceText /* string */,ExampleId /* integer */});
};

module.exports = LabelExampleResponse;
