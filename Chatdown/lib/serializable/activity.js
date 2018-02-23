const ActivityType = require('../enums/activityType');

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
     * @property relatesTo
     */

    /**
     *
     * @param attachments
     * @param text
     * @param timestamp
     * @param id
     * @param type
     */
    constructor({attachments, text, timestamp, id, type = ActivityType.Message} = {}) {
        Object.assign(this, {attachments, text, timestamp, id, type});
    }
};
