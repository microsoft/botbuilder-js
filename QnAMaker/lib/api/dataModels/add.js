const QnaPair = require('./qnaPair');

class Add {

    /**
     * @property {QnaPair[]} qnaPairs
     */

    /**
     * @property {string[]} urls
     */


    constructor({qnaPairs /* QnaPair[] */, urls /* string[] */} = {}) {
        Object.assign(this, {qnaPairs /* QnaPair[] */, urls /* string[] */});
    }
}

Add.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(Add.fromJSON);
    }

    source.qnaPairs = QnaPair.fromJSON(source.qnaPairs) || undefined;

    const {qnaPairs /* QnaPair[] */, urls /* string[] */} = source;
    return new Add({qnaPairs /* QnaPair[] */, urls /* string[] */});
};

module.exports = Add;
