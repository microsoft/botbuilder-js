const QnaPair = require('./qnaPair');

class DeleteVaue {

    /**
     * @property {QnaPair[]} qnaPairs
     */


    constructor({qnaPairs /* QnaPair[] */} = {}) {
        Object.assign(this, {qnaPairs /* QnaPair[] */});
    }
}

DeleteVaue.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(DeleteVaue.fromJSON);
    }

    source.qnaPairs = QnaPair.fromJSON(source.qnaPairs) || undefined;

    const {qnaPairs /* QnaPair[] */} = source;
    return new DeleteVaue({qnaPairs /* QnaPair[] */});
};

module.exports = DeleteVaue;
