class ApplicationSettingUpdateObject {

    /**
     * @property {boolean} public
     */


    constructor({value /* boolean */} = {}) {
        Object.assign(this, {'public': value /* boolean */});
    }
}

ApplicationSettingUpdateObject.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ApplicationSettingUpdateObject.fromJSON);
    }

    const {'public': value /* boolean */} = source;
    return new ApplicationSettingUpdateObject({'public': value /* boolean */});
};

module.exports = ApplicationSettingUpdateObject;
