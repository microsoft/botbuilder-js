const {ServiceBase} = require('../serviceBase');
class Regexentities extends ServiceBase {
    constructor() {
        super('/apps/{appId}/versions/{versionId}/regexentities');
    }

    /**
    * undefined
    */
    CreateRegexEntityModel(params , regexEntityExtractorCreateObj/* RegexModelCreateObject */) {
        return this.createRequest('', params, 'post', regexEntityExtractorCreateObj);
    }
    /**
    * undefined
    */
    GetRegexEntityInfos(params) {
        return this.createRequest('', params, 'get');
    }
    /**
    * undefined
    */
    CreateRegexEntityRole(params , entityRoleCreateObject/* EntityRoleCreateObject */) {
        return this.createRequest('/{entityId}/roles', params, 'post', entityRoleCreateObject);
    }
    /**
    * undefined
    */
    GetRegexEntityRoles(params) {
        return this.createRequest('/{entityId}/roles', params, 'get');
    }
    /**
    * undefined
    */
    DeleteRegexEntityRole(params) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'delete');
    }
    /**
    * undefined
    */
    UpdateRegexEntityRole(params , entityRoleUpdateObject/* EntityRoleUpdateObject */) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'put', entityRoleUpdateObject);
    }
    /**
    * undefined
    */
    GetRegexEntityRole(params) {
        return this.createRequest('/{entityId}/roles/{roleId}', params, 'get');
    }
    /**
    * undefined
    */
    DeleteRegexEntityModel(params) {
        return this.createRequest('/{regexEntityId}', params, 'delete');
    }
    /**
    * undefined
    */
    UpdateRegexEntityModel(params , regexEntityUpdateObject/* RegexModelUpdateObject */) {
        return this.createRequest('/{regexEntityId}', params, 'put', regexEntityUpdateObject);
    }
    /**
    * undefined
    */
    GetRegexEntityEntityInfo(params) {
        return this.createRequest('/{regexEntityId}', params, 'get');
    }
}
module.exports = Regexentities;
