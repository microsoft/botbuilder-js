const JSONActionParam = require('./jsonActionParam');
const Channel = require('./channel');

class JSONAction {

    /**
     * @property {string} actionName
     */

    /**
     * @property {JSONActionParam[]} actionParameters
     */

    /**
     * @property {string} intentName
     */

    /**
     * @property {Channel} channel
     */


    constructor({actionName /* string */, actionParameters /* JSONActionParam[] */, intentName /* string */, channel /* Channel */} = {}) {
        Object.assign(this, {
            actionName /* string */,
            actionParameters /* JSONActionParam[] */,
            intentName /* string */,
            channel /* Channel */
        });
    }
}

JSONAction.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(JSONAction.fromJSON);
    }

    source.actionParameters = JSONActionParam.fromJSON(source.actionParameters) || undefined;

    source.channel = Channel.fromJSON(source.channel) || undefined;

    const {actionName /* string */, actionParameters /* JSONActionParam[] */, intentName /* string */, channel /* Channel */} = source;
    return new JSONAction({
        actionName /* string */,
        actionParameters /* JSONActionParam[] */,
        intentName /* string */,
        channel /* Channel */
    });
};

module.exports = {JSONAction};
