/**
 * Copyright(c) Microsoft Corporation.All rights reserved.
 * Licensed under the MIT License.
 */
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
     * @param recipient
     * @param from
     * @param text
     * @param timestamp
     * @param type
     * @param channelId
     */
    constructor({attachments, conversation, id, recipient, from, text, timestamp, type, channelId = 'chatdown'} = {}) {
        Object.assign(this, {attachments, conversation, id, recipient, from, text, timestamp, type, channelId});
    }
};
