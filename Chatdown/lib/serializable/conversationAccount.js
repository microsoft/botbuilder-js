let _id = 0;
module.exports = class ConversationAccount {
    /**
     * @property isGroup
     */
    /**
     * @property name
     */

    /**
     * @property id
     */

    /**
     *
     * @param isGroup
     * @param name
     * @param id
     */
    constructor({isGroup, name, id = '' + (_id++)} = {}) {
        Object.assign(this, {isGroup, name, id});
    }
};
