const {ServiceBase} = require('../serviceBase');

class Suggest extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/suggest');
    }

    /**
     * Deleted an unlabelled utterance.
     */
    deleteUnlabelledUtterance(params, body) {
        return this.createRequest('', params, 'delete', body);
    }
}

module.exports = Suggest;
