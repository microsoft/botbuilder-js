module.exports = class ChannelAccount {
    /**
     * @property id
     */

    /**
     * @property name
     */

    /**
     * @property role
     */

    /**
     *
     * @param id
     * @param name
     * @param role
     */
    constructor({id = 'joe@smith.com', name, role} = {}) {
        Object.assign(this, {id, name, role});
    }
};
