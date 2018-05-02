const {ServiceBase} = require('../serviceBase');
class Permissions extends ServiceBase {
    constructor() {
        super('/apps/{appId}/permissions');
    }

    /**
    * Replaces the current users access list with the one sent in the body. If an empty list is sent, all access to other users will be removed.
    */
    Update(params , collaborators/* CollaboratorsArray */) {
        return this.createRequest('', params, 'put', collaborators);
    }
    /**
    * Removes a user from the allowed list of users to access this LUIS application. Users are removed using their email address.
    */
    Delete(params , userToDelete/* UserCollaborator */) {
        return this.createRequest('', params, 'delete', userToDelete);
    }
    /**
    * Adds a user to the allowed list of users to access this LUIS application. Users are added using their email address.
    */
    Add(params , userToAdd/* UserCollaborator */) {
        return this.createRequest('', params, 'post', userToAdd);
    }
    /**
    * Gets the list of user emails that have permissions to access your application.
    */
    List(params) {
        return this.createRequest('', params, 'get');
    }
}
module.exports = Permissions;
