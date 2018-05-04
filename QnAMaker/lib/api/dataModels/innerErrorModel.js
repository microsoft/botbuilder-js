/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */


class InnerErrorModel {
    
    /**
    * @property {string} code
    */

    /**
    * @property {undefined} innerError
    */

    
    constructor({code /* string */,innerError /* undefined */} = {}) {
        Object.assign(this, {code /* string */,innerError /* undefined */});
    }
}
InnerErrorModel.fromJSON = function(src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(InnerErrorModel.fromJSON);
    }
    
    const {code /* string */,innerError /* undefined */} = src;
    return new InnerErrorModel({code /* string */,innerError /* undefined */});
};

module.exports = InnerErrorModel;
