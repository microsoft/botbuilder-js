const {ServiceBase} = require('../serviceBase');
class Clone extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/clone');
    }

    /**
    * Creates a new version using the current snapshot of the selected application version.
    */
    Clone(params , versionCloneObject/* TaskUpdateObject */) {
        return this.createRequest('', params, 'post', versionCloneObject);
    }
}
module.exports = Clone;
