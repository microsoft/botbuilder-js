const {ServiceBase} = require('../serviceBase');

class Clone extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/clone');
    }

    /**
     * Creates a new version equivalent to the current snapshot of the selected application version.
     */
    async cloneVersion(params, taskUpdateObject/* TaskUpdateObject */) {
        return this.createRequest('', params, 'post', taskUpdateObject);
    }
}

module.exports = Clone;
