const {ServiceBase} = require('./serviceBase');
class Alterations extends ServiceBase {
    constructor() {
        super('/alterations');
    }

    /**
    * 
    */
    replaceAlterations(params , wordAlterations/* WordAlterationsDTO */) {
        return this.createRequest('', params, 'put', wordAlterations);
    }
    /**
    * 
    */
    downloadAlterations(params) {
        return this.createRequest('', params, 'get');
    }
}
module.exports = Alterations;
