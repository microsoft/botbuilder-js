/**
  * Copyright (c) Microsoft Corporation. All rights reserved.
  * Licensed under the MIT License.
  */


class ErrorObject {
    
    /**
    * @property {undefined} code
    */

    /**
    * @property {string} message
    */

    /**
    * @property {string} target
    */

    /**
    * @property {ErrorObject[]} details
    */

    /**
    * @property {undefined} innerError
    */

    
    constructor({code /* undefined */,message /* string */,target /* string */,details /* ErrorObject[] */,innerError /* undefined */} = {}) {
        Object.assign(this, {code /* undefined */,message /* string */,target /* string */,details /* ErrorObject[] */,innerError /* undefined */});
    }
}
ErrorObject.fromJSON = function(src) {
    if (!src) {
        return null;
    }
    if (Array.isArray(src)) {
        return src.map(ErrorObject.fromJSON);
    }
    
    src.details = ErrorObject.fromJSON(src.details) || undefined;

    const {code /* undefined */,message /* string */,target /* string */,details /* ErrorObject[] */,innerError /* undefined */} = src;
    return new ErrorObject({code /* undefined */,message /* string */,target /* string */,details /* ErrorObject[] */,innerError /* undefined */});
};

module.exports = ErrorObject;
