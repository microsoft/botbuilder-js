class Setting {

    /**
     * @property {string} name
     */

    /**
     * @property {string} value
     */


    constructor({name /* string */, value /* string */} = {}) {
        Object.assign(this, {name /* string */, value /* string */});
    }
}

Setting.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(Setting.fromJSON);
    }

    const {name /* string */, value /* string */} = source;
    return new Setting({name /* string */, value /* string */});
};

module.exports = Setting;
