const Add = require('./add');
const DeleteValue = require('./deleteValue');

class UpdateKnowledgeBase {

    /**
     * @property {Add} add
     */

    /**
     * @property {DeleteValue} deleteValue
     */


    constructor({add /* Add */, deleteValue /* DeleteValue */} = {}) {
        Object.assign(this, {add /* Add */, deleteValue /* DeleteValue */});
    }
}

UpdateKnowledgeBase.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(UpdateKnowledgeBase.fromJSON);
    }

    source.add = Add.fromJSON(source.add) || undefined;

    source.deleteValue = DeleteValue.fromJSON(source.deleteValue) || undefined;

    const {add /* Add */, deleteValue /* DeleteValue */} = source;
    return new UpdateKnowledgeBase({add /* Add */, deleteValue /* DeleteValue */});
};

module.exports = UpdateKnowledgeBase;
