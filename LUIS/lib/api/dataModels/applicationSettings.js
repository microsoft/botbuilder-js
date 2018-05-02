/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class ApplicationSettings {
    
    /**
    * @property {string} id
    */

    /**
    * @property {boolean} public
    */

    
    constructor(args = {} ) {
        Object.assign(this, args);
    }
}
ApplicationSettings.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ApplicationSettings.fromJSON);
    }
    
    return new ApplicationSettings(source);
};

module.exports = ApplicationSettings;
