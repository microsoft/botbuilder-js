class ApplicationSettingUpdateObject {

    /**
     * @property {boolean} public
     */


    constructor({public /* boolean */} = {}) {
        Object.assign(this, {public /* boolean */});
    }
}

ApplicationSettingUpdateObject.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(ApplicationSettingUpdateObject.fromJSON);
    }

    const {public /* boolean */} = source;
    return new ApplicationSettingUpdateObject({public /* boolean */});
};

module.exports = {ApplicationSettingUpdateObject};
