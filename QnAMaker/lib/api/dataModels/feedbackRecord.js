class FeedbackRecord {

    /**
     * @property {string} userId
     */

    /**
     * @property {string} userQuestion
     */

    /**
     * @property {string} kbQuestion
     */

    /**
     * @property {string} kbAnswer
     */


    constructor({userId /* string */, userQuestion /* string */, kbQuestion /* string */, kbAnswer /* string */} = {}) {
        Object.assign(this, {
            userId /* string */,
            userQuestion /* string */,
            kbQuestion /* string */,
            kbAnswer /* string */
        });
    }
}

FeedbackRecord.fromJSON = function (source) {
    if (!source) {
        return null;
    }
    if (Array.isArray(source)) {
        return source.map(FeedbackRecord.fromJSON);
    }

    const {userId /* string */, userQuestion /* string */, kbQuestion /* string */, kbAnswer /* string */} = source;
    return new FeedbackRecord({
        userId /* string */,
        userQuestion /* string */,
        kbQuestion /* string */,
        kbAnswer /* string */
    });
};

module.exports = FeedbackRecord;
