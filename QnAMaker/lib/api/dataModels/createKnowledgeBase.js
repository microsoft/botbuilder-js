const QnaPair = require('./qnaPair');

class CreateKnowledgeBase {

    /**
     * @property {string} name
     */

    /**
     * @property {QnaPair[]} qnaPairs
     */

    /**
     * @property {string[]} urls
     */


    constructor({name /* string */, qnaPairs /* QnaPair[] */, urls /* string[] */} = {}) {
        Object.assign(this, {name /* string */, qnaPairs /* QnaPair[] */, urls /* string[] */});
    }
}

CreateKnowledgeBase.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(CreateKnowledgeBase.fromJSON);
    }

    source.qnaPairs = QnaPair.fromJSON(source.qnaPairs) || undefined;

    const {name /* string */, qnaPairs /* QnaPair[] */, urls /* string[] */} = source;
    return new CreateKnowledgeBase({name /* string */, qnaPairs /* QnaPair[] */, urls /* string[] */});
};

module.exports = CreateKnowledgeBase;
