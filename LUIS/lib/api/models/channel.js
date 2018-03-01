const Setting = require('./setting');

class Channel {

    /**
     * @property {Setting[]} settings
     */

    /**
     * @property {string} name
     */

    /**
     * @property {string} method
     */


    constructor({settings /* Setting[] */, name /* string */, method /* string */} = {}) {
        Object.assign(this, {settings /* Setting[] */, name /* string */, method /* string */});
    }
}

Channel.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(Channel.fromJSON);
    }

    source.settings = Setting.fromJSON(source.settings) || undefined;

    const {settings /* Setting[] */, name /* string */, method /* string */} = source;
    return new Channel({settings /* Setting[] */, name /* string */, method /* string */});
};

module.exports = {Channel};
