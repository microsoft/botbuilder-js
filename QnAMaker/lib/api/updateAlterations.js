const {ServiceBase} = require('./serviceBase');

class UpdateAlterations extends ServiceBase {
    constructor() {
        super('/knowledgebases/{knowledgeBaseID}/updateAlterations');
    }

    /**
     * Replaces word alterations (synonyms) for the KB with the give records.
     */
    updateAlterations(params, updateAlterations/* UpdateAlterations */) {
        return this.createRequest('', params, 'patch', updateAlterations);
    }
}

module.exports = UpdateAlterations;
