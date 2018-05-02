/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class ModelInfo {
    
    /**
    * @property {string} id
    */

    /**
    * @property {string} name
    */

    /**
    * @property {integer} typeId
    */

    /**
    * @property {undefined} readableType
    */

    
    constructor({id /* string */,name /* string */,typeId /* integer */,readableType /* undefined */} = {}) {
        Object.assign(this, {id /* string */,name /* string */,typeId /* integer */,readableType /* undefined */});
    }
}
ModelInfo.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ModelInfo.fromJSON);
    }
    
    const {id /* string */,name /* string */,typeId /* integer */,readableType /* undefined */} = source;
    return new ModelInfo({id /* string */,name /* string */,typeId /* integer */,readableType /* undefined */});
};

module.exports = ModelInfo;
