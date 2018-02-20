const ActivityType = require('./activityType');

class Activity {
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

    constructor({ attachments = [], text = '', timestamp = '', id = -1, type = ActivityType.Message } = {}) {
        Object.assign(this, { attachments, text, timestamp, id, type });
    }
}

module.exports = Activity;
