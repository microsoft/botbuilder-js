module.exports = class ChannelAccount {
    /**
     * @property id
     */

    /**
     * @property name
     */

    /**
     *
     * @param id
     * @param name
     */
    constructor({id='joe@smith.com', name}){
        Object.assign(this, {id, name});
    }
};
