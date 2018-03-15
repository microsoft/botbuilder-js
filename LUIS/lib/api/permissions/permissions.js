const {ServiceBase} = require('../serviceBase');

class Permissions extends ServiceBase {
    constructor() {
        super('/apps/{appId}/permissions');
    }

    /**
     * Replaces the current users access list with the one sent in the body.
     If an empty list is sent, all access to other users will be removed.

     */
    updateAccessList(params, body) {
        return this.createRequest('', params, 'put', body);
    }

    /**
     * Removed a user to the allowed list of users to access this LUIS application.
     Users are removed using their email address.
     */
    removeUserFromAccessList(params, body) {
        return this.createRequest('', params, 'delete', body);
    }

    /**
     * Adds a user to the allowed list of users to access this LUIS application.
     Users are added using their email address.
     */
    addEmailToAccessList(params, body) {
        return this.createRequest('', params, 'post', body);
    }

    /**
     * Gets the list of user emails that have permissions to access your application.
     */
    getUserAccessList(params) {
        return this.createRequest('', params, 'get');
    }
}

module.exports = Permissions;
