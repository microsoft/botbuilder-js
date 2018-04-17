module.exports = class Attachment {

    /**
     * @property contentType
     */

    /**
     * @property contentUrl
     */

    /**
     * @property content
     */

    /**
     * 
     * @param contentType
     * @param contentUrl
     * @param content
     */
    constructor({ contentType = '', contentUrl = null, content = null } = {}) {
        Object.assign(this, { contentType, contentUrl, content });
    }
};
