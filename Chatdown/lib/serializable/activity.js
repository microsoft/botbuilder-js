module.exports = class Activity {
    /**
     *
     * @property {Attachment[]} attachments
     */

    /**
     * @property text
     */

    /**
     * @property timestamp
     */

    /**
     * @property id
     */

    /**
     * @property type
     */

    /**
     * @property from
     */

    /**
     * @property recipient
     */

    /**
     * @property conversation
     */

    /**
     *
     * @param attachments
     * @param conversation
     * @param id
     * @param text
     * @param timestamp
     * @param type
     * @param recipient
     */
    constructor({attachments, conversation, id, recipient, text, timestamp, type} = {}) {
        Object.assign(this, {attachments, conversation, id, recipient, text, timestamp, type});
    }
};
