/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */


class ApplicationSettingUpdateObject {

    /**
    * @property {boolean} public
    */


    constructor(args = {}) {
        Object.assign(this, args);
    }
}
ApplicationSettingUpdateObject.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ApplicationSettingUpdateObject.fromJSON);
    }

    return new ApplicationSettingUpdateObject(source);
};

module.exports = ApplicationSettingUpdateObject;
