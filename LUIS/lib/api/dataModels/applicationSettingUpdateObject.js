class ApplicationSettingUpdateObject {

    /**
     * @property {boolean} public
     */


    constructor({p /* boolean */} = {}) {
        Object.assign(this, {p /* boolean */});
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

module.exports = ApplicationSettingUpdateObject;
