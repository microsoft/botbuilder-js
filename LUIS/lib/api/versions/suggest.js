const {ServiceBase} = require('../serviceBase');
class Suggest extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/suggest');
    }

    /**
    * Deleted an unlabelled utterance.
    */
    DeleteUnlabelledUtterance(params , utterance) {
        return this.createRequest('', params, 'delete', utterance);
    }
}
module.exports = Suggest;
