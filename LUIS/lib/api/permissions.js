const {ServiceBase} = require('./serviceBase');

class Permissions extends ServiceBase {
    constructor() {
        super('/apps/{appId}/permissions');
    }

    /**
     * Replaces the current users access list with the one sent in the body.
     If an empty list is sent, all access to other users will be removed.

     */
    async updateAccessList(body) {
        return this.createRequest('put', [], body);
    }

    /**
     * Removed a user to the allowed list of users to access this LUIS application.
     Users are removed using their email address.
     */
    async removeUserFromAccessList(body) {
        return this.createRequest('delete', [], body);
    }

    /**
     * Adds a user to the allowed list of users to access this LUIS application.
     Users are added using their email address.
     */
    async addEmailToAccessList(body) {
        return this.createRequest('post', [], body);
    }

    /**
     * Gets the list of user emails that have permissions to access your application.
     */
    async getUserAccessList() {
        return this.createRequest('get', []);
    }

}

module.exports = {Permissions};
