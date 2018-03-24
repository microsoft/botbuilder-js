const {ServiceBase} = require('./serviceBase');

class DownloadAlterations extends ServiceBase {
    constructor() {
        super('/knowledgebases/{knowledgeBaseID}/downloadAlterations');
    }

    /**
     * Downloads all word alterations (synonyms) that have been automatically mined or added by the user.
     */
    downloadAlterations(params) {
        return this.createRequest('', params, 'get');
    }
}

module.exports = DownloadAlterations;
