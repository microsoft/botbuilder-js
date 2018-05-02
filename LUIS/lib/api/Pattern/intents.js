const {ServiceBase} = require('../serviceBase');
class Intents extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/intents/{intentId}/patternrules');
    }

    /**
    * undefined
    */
    GetIntentPatterns(params) {
        return this.createRequest('/{intentId}/patternrules', params, 'get');
    }
}
module.exports = Intents;
