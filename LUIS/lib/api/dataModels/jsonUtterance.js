/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */

const JSONEntity = require('./jsonEntity');

class JSONUtterance {
    
    /**
    * @property {string} text
    */

    /**
    * @property {string} intent
    */

    /**
    * @property {JSONEntity[]} entities
    */

    
    constructor({text /* string */,intent /* string */,entities /* JSONEntity[] */} = {}) {
        Object.assign(this, {text /* string */,intent /* string */,entities /* JSONEntity[] */});
    }
}
JSONUtterance.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(JSONUtterance.fromJSON);
    }
    
    source.entities = JSONEntity.fromJSON(source.entities) || undefined;

    const {text /* string */,intent /* string */,entities /* JSONEntity[] */} = source;
    return new JSONUtterance({text /* string */,intent /* string */,entities /* JSONEntity[] */});
};

module.exports = JSONUtterance;
