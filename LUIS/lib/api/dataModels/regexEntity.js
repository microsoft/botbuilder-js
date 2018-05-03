/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class RegexEntity {
    
    /**
    * @property {string} name
    */

    /**
    * @property {string} regexPattern
    */

    /**
    * @property {string[]} roles
    */

    
    constructor({name /* string */,regexPattern /* string */,roles /* string[] */} = {}) {
        Object.assign(this, {name /* string */,regexPattern /* string */,roles /* string[] */});
    }
}
RegexEntity.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(RegexEntity.fromJSON);
    }
    
    const {name /* string */,regexPattern /* string */,roles /* string[] */} = source;
    return new RegexEntity({name /* string */,regexPattern /* string */,roles /* string[] */});
};

module.exports = RegexEntity;
