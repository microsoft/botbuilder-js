const {ServiceBase} = require('./serviceBase');

class Suggest extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/suggest');
    }

    /**
     * Deleted an unlabelled utterance.
     */
    async deleteUnlabelledUtterance(body) {
        return this.createRequest('delete', [], body);
    }

}

module.exports = {Suggest};
