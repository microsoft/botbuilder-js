

class UserCollaborator {
    
    /**
    * @property {string} email
    */

    
    constructor({email /* string */} = {}) {
        Object.assign(this, {email /* string */});
    }
}
UserCollaborator.fromJSON = function(source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(UserCollaborator.fromJSON);
    }
    
    const {email /* string */} = source;
    return new UserCollaborator({email /* string */});
};

module.exports = UserCollaborator;
