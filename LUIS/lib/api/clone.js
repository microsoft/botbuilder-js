const {ServiceBase} = require('./serviceBase');

class Clone extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/clone');
    }

    /**
     * Creates a new version equivalent to the current snapshot of the selected application version.
     */
    async cloneVersion(taskUpdateObject/* TaskUpdateObject */) {
        return this.createRequest('post', [], taskUpdateObject);
    }

}

module.exports = {Clone};
