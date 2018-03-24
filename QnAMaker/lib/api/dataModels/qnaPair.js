class QnaPair {

    /**
     * @property {string} answer
     */

    /**
     * @property {string} question
     */


    constructor({answer /* string */, question /* string */} = {}) {
        Object.assign(this, {answer /* string */, question /* string */});
    }
}

QnaPair.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(QnaPair.fromJSON);
    }

    const {answer /* string */, question /* string */} = source;
    return new QnaPair({answer /* string */, question /* string */});
};

module.exports = QnaPair;
